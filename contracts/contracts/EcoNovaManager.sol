// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./EcoNovaToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./helpers/ethsign.sol";
import "hardhat/console.sol";
import "./CustomToken.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract EcoNovaManager is Ownable {
    /**
     * mappings
     */
    mapping(address => PointData) public userPoints;
    mapping(address => uint256) public donations;
    mapping(address => uint256) public userDonations;
    mapping(address => mapping(string => uint256)) public userDonationsOrgs;
    mapping(bytes32 => bool) public usedHashes;
    mapping(uint256 => mapping(uint256 => bool)) public userAddedTweets;
    mapping(string => address) public charityOrganizations;

    /**
     * constants
     */
    uint256 public constant POINT_BASIS = 35;
    uint256 public constant DONATION_POINT_PER_USD = POINT_BASIS * 2;
    uint256 public constant FIAT_DECIMALS = 10 ** 2;
    address public constant ETH_ADDRESS = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    address public botAddress;
    uint256 public constant SLIPPAGE_TOLERANCE_BPS = 200;
    uint256 public constant ONE_DAY = 60 * 60 * 24;

    /**
     * immutable variables
     */
    EcoNovaToken public immutable i_ecoNovaToken;
    IPyth public immutable i_pyth;

    /**
     * error messages
     */
    error EcoNovaManager__InsufficientPoints();
    error EcoNovaManager__ConversionNotAvailable();
    error EcoNovaManager__SendingFailed();
    error EcoNovaManager__IncorrectETHAmount();
    error EcoNovaManager__InsufficientBalance();
    error EcoNovaManager__HashAlreadyUsed();
    error EcoNovaManager__AddressCannotBeZero();
    error EcoNovaManager__InvalidSignature();
    error EcoNovaManager__Unauthorized();
    error EcoNovaManager__TweetIdAlreadyRecorderForUser();
    error EcoNovaManager__SignatureNotValidForChainId();
    error EcoNovaManager__CharityNameNotFound();
    error EcoNovaManager__CanNotBeZero();
    error EcoNovaManager__InvalidCharityAddress();
    error EcoNovaManager__CharityCannotWithdraw();

    /**
     * events
     */
    event PointsAdded(address indexed user, uint256 points);
    event PointsRedeemed(address indexed user, uint256 points);
    event SetOracle(address indexed oldOrocle, address indexed newOrocle);
    event Donated(address indexed user, address indexed token, uint256 amount);
    event DonationWithdrawed(address indexed user, address indexed token, uint256 amount);
    event BotAddressUpdated(address indexed oldBotAddress, address indexed newBotAddress);
    event TokenCreated(address indexed token, string name, string symbol, uint256 initialSupply);

    /**
     * structs
     */
    struct PointData {
        uint256 points;
        uint256 updatedTimeStamp;
        uint256 createdTimeStamp;
        address user;
    }

    constructor(address oracleAddress, address _botAddress) Ownable(msg.sender) {
        i_ecoNovaToken = new EcoNovaToken();
        botAddress = _botAddress;
        i_pyth = IPyth(oracleAddress);
        emit SetOracle(oracleAddress, oracleAddress);
    }

    function deployToken(string memory name, string memory symbol, uint256 initialSupply) public {
        if (initialSupply <= 0) {
            revert EcoNovaManager__CanNotBeZero();
        }
        CustomToken token = new CustomToken(name, symbol, initialSupply, msg.sender);
        emit TokenCreated(address(token), name, symbol, initialSupply);
    }

    /**
     * @dev Converts USD amount to token amount based on oracle price data.
     * @param amountInUsd The amount in USD (assumed to have 2 decimals).
     * @return amountToSend The equivalent token amount.
     */
    function getUsdToTokenPrice(address token, uint256 amountInUsd) public view returns (uint256) {
        if (token == ETH_ADDRESS) {
            (uint256 priceOfTokenInUsd, uint8 priceDecimals) = getPricePyth();

            uint8 tokenDecimals = 18;

            uint256 amountToSendNumerator = amountInUsd *
                (10 ** tokenDecimals) *
                (10 ** priceDecimals);
            uint256 amountToSendDenominator = priceOfTokenInUsd;

            uint256 amountToSend = amountToSendNumerator / amountToSendDenominator;

            return amountToSend / FIAT_DECIMALS;
        }
        revert EcoNovaManager__ConversionNotAvailable();
    }

    /**
     * @dev Token price will use 18 decimal for all token
     * @return price
     * @return decimals
     */
    function getPricePyth() public view returns (uint256, uint8) {
        bytes32 priceFeedId = 0xf490b178d0c85683b7a0f2388b40af2e6f7c90cbe0f96b31f315f08d0e5a2d6d; // S/USD
        PythStructs.Price memory price = i_pyth.getPriceNoOlderThan(priceFeedId, ONE_DAY);

        return (
            uint256(uint64(price.price < 0 ? -price.price : price.price)),
            uint8(uint32(price.expo < 0 ? -price.expo : price.expo))
        );
    }

    /**
     * @dev Donate ETH or ERC20 tokens to the foundation.
     * @param charityOrg The name of the charity organization.
     * @param token The address of the token to donate.
     * @param amountInUsd The amount in USD (assumed to have 2 decimals).
     */

    function donateToFoundation(
        string memory charityOrg,
        address token,
        uint256 amountInUsd
    ) public payable {
        if (charityOrganizations[charityOrg] == address(0)) {
            revert EcoNovaManager__CharityNameNotFound();
        }

        address charityAddress = charityOrganizations[charityOrg];

        uint256 size;
        assembly {
            size := extcodesize(charityAddress)
        }
        if (size == 0) {
            revert EcoNovaManager__InvalidCharityAddress();
        }

        (bool canWithdraw, bytes memory data) = charityAddress.call(
            abi.encodeWithSignature("canWithdraw()")
        );

        if (!canWithdraw || (data.length > 0 && abi.decode(data, (bool)) == false)) {
            revert EcoNovaManager__CharityCannotWithdraw();
        }

        if (amountInUsd <= 0) {
            revert EcoNovaManager__CanNotBeZero();
        }

        address caller = msg.sender;
        uint256 amountToSend = getUsdToTokenPrice(token, amountInUsd);

        uint256 minTokenAmount = (amountToSend * (10000 - SLIPPAGE_TOLERANCE_BPS)) / 10000;
        uint256 maxTokenAmount = (amountToSend * (10000 + SLIPPAGE_TOLERANCE_BPS)) / 10000;

        uint256 pointsEarned = (amountInUsd * DONATION_POINT_PER_USD) / FIAT_DECIMALS;
        PointData storage userPointData = userPoints[caller];

        if (userPointData.points > 0) {
            userPointData.points += pointsEarned;
            userPointData.updatedTimeStamp = block.timestamp;
        } else {
            userPoints[caller] = PointData(pointsEarned, block.timestamp, block.timestamp, caller);
        }

        if (token == ETH_ADDRESS) {
            if (msg.value < minTokenAmount || msg.value > maxTokenAmount) {
                revert EcoNovaManager__IncorrectETHAmount();
            }
            donations[ETH_ADDRESS] += msg.value;
            userDonations[caller] += msg.value;
            userDonationsOrgs[caller][charityOrg] += msg.value;
            (bool success, ) = charityAddress.call{value: amountToSend}("");
            if (!success) {
                revert EcoNovaManager__SendingFailed();
            }
        } else {
            IERC20(token).transfer(charityAddress, amountToSend);
        }

        emit PointsAdded(caller, userPoints[caller].points);
        emit Donated(caller, token, amountToSend);
    }

    /**
     * @dev Withdraw the donation from the contract.
     * @param token The address of the token to withdraw.
     * @param amount The amount to withdraw.
     */
    function withdrawDonation(address token, uint256 amount) public onlyOwner {
        if (token == ETH_ADDRESS) {
            if (address(this).balance < amount) {
                revert EcoNovaManager__InsufficientBalance();
            }

            (bool success, ) = owner().call{value: amount}("");
            if (!success) {
                revert EcoNovaManager__SendingFailed();
            }
        } else {
            IERC20(token).transfer(owner(), amount);
        }
        emit DonationWithdrawed(owner(), token, amount);
    }

    function testHash(
        uint256 pointToAdd,
        uint256 userTwitterId,
        uint256 tweetId,
        bytes memory
    ) public view returns (bytes32 message) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(msg.sender, pointToAdd, userTwitterId, tweetId, block.chainid)
        );
        bytes32 ethSignedMessageHash = EthSign.getEthSignedMessageHash(messageHash);
        return ethSignedMessageHash;
    }

    /**
     * @dev Adds points signed by twitter bot to the user
     * @param pointToAdd points to add
     * @param signature signature of the message
     */
    function addPointsFromTwitterBot(
        uint256 pointToAdd,
        uint256 userTwitterId,
        uint256 tweetId,
        bytes memory signature
    ) public {
        bytes32 messageHash = keccak256(
            abi.encodePacked(msg.sender, pointToAdd, userTwitterId, tweetId, block.chainid)
        );
        bytes32 ethSignedMessageHash = EthSign.getEthSignedMessageHash(messageHash);

        if (userAddedTweets[userTwitterId][tweetId]) {
            revert EcoNovaManager__TweetIdAlreadyRecorderForUser();
        }

        if (usedHashes[messageHash]) {
            revert EcoNovaManager__HashAlreadyUsed();
        }

        if (EthSign.recoverSigner(ethSignedMessageHash, signature) != botAddress) {
            revert EcoNovaManager__InvalidSignature();
        }

        if (pointToAdd <= 0) {
            revert EcoNovaManager__InsufficientPoints();
        }

        usedHashes[messageHash] = true;
        userAddedTweets[userTwitterId][tweetId] = true;

        uint256 points = pointToAdd * POINT_BASIS;

        PointData storage userPointData = userPoints[msg.sender];

        userPointData.points += points;
        userPointData.updatedTimeStamp = block.timestamp;

        emit PointsAdded(msg.sender, userPointData.points);
    }

    /**
     * @dev Add points to the user based on the weight of the waste
     * @param weightInGrams weight in grams of the waste
     */
    function addPointFromWeight(uint256 weightInGrams) public {
        uint256 points = weightInGrams * POINT_BASIS;

        PointData memory userPointData = userPoints[msg.sender];

        if (weightInGrams <= 0) {
            revert EcoNovaManager__InsufficientPoints();
        }

        if (userPointData.points > 0) {
            userPointData.points += points;
            userPointData.updatedTimeStamp = block.timestamp;
            userPoints[msg.sender] = userPointData;
        } else {
            PointData memory pointData = PointData(
                points,
                block.timestamp,
                block.timestamp,
                msg.sender
            );
            userPoints[msg.sender] = pointData;
        }

        emit PointsAdded(msg.sender, userPoints[msg.sender].points);
    }

    /**
     * @dev Redeem points to get ERC20 token
     * @param point points to redeem
     * @return success true if the point is redeemed successfully
     */
    function redeemPoints(uint256 point) public returns (bool success) {
        if (userPoints[msg.sender].points == 0) {
            revert EcoNovaManager__InsufficientPoints();
        }
        if (userPoints[msg.sender].points < point) {
            revert EcoNovaManager__InsufficientPoints();
        }
        userPoints[msg.sender].points -= point;

        i_ecoNovaToken.mint(msg.sender, point * 10 ** i_ecoNovaToken.decimals());
        emit PointsRedeemed(msg.sender, point);
        emit PointsAdded(msg.sender, userPoints[msg.sender].points);
        return true;
    }

    /**
     * @dev Update the bot address (only callable by the bot)
     * @param _newBotAddress The new bot address
     */
    function updateBotAddress(address _newBotAddress) public onlyOwner {
        if (_newBotAddress == address(0)) {
            revert EcoNovaManager__AddressCannotBeZero();
        }
        address oldBotAddress = botAddress;
        botAddress = _newBotAddress;
        emit BotAddressUpdated(oldBotAddress, _newBotAddress);
    }
}

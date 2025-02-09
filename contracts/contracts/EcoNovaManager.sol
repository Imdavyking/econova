// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./EcoNovaToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";
import "./CustomToken.sol";
import "./charity/Charity.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "./interfaces/IGroth16VerifierP3.sol";

contract EcoNovaManager is Ownable, ReentrancyGuard {
    /**
     * mappings
     */
    mapping(address => PointData) public userPoints;
    mapping(address => uint256) public donations;
    mapping(address => uint256) public userDonations;
    mapping(address => mapping(uint8 => uint256)) public userDonationsOrgs;
    mapping(bytes32 => bool) public usedHashes;
    mapping(uint256 => mapping(uint256 => bool)) public userAddedTweets;
    mapping(uint8 => address) public charityOrganizations;
    mapping(address => bool) public userBMIHealthy;

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
    uint256 public charityLength;

    /**
     * immutable variables
     */
    EcoNovaToken public immutable i_ecoNovaToken;

    IPyth public immutable i_pyth;
    IGroth16VerifierP3 public immutable i_groth16VerifierP3;

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
    error EcoNovaManager__CharityNameCanNotBeNull();
    error EcoNovaManager__CharityAlreadyExists();
    error EcoNovaManager__CharityNotFound();
    error EcoNovaManager__IncorrectBalance();

    /**
     * events
     */
    event PointsAdded(address indexed user, uint256 points);
    event PointsRedeemed(address indexed user, uint256 points);
    event SetOracle(address indexed oldOrocle, address indexed newOrocle);
    event Donated(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint8 charityCategory
    );
    event BotAddressUpdated(address indexed oldBotAddress, address indexed newBotAddress);
    event TokenCreated(address indexed token, string name, string symbol, uint256 initialSupply);
    event CharityAdded(uint8 indexed charityCategory, address charityAddress);
    event CharityRemoved(uint8 indexed charityCategory);
    event BMIRecorded(address indexed user, bool isHealthy);

    /**
     * structs
     */
    struct PointData {
        uint256 points;
        uint256 updatedTimeStamp;
        uint256 createdTimeStamp;
        address user;
    }

    constructor(
        address oracleAddress,
        address _botAddress,
        Charity[] memory _charity,
        IGroth16VerifierP3 _groth16VerifierP3
    ) Ownable(msg.sender) {
        i_ecoNovaToken = new EcoNovaToken();
        botAddress = _botAddress;
        i_pyth = IPyth(oracleAddress);
        i_groth16VerifierP3 = _groth16VerifierP3;
        for (uint256 i = 0; i < _charity.length; i++) {
            addCharity(_charity[i]);
        }
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

            uint8 tokenDecimals = getTokenDecimals(token);

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
     * @dev Get token decimals
     * @param token The address of the token.
     */
    function getTokenDecimals(address token) internal view returns (uint8) {
        (bool success, bytes memory data) = token.staticcall(
            abi.encodeWithSignature("decimals()")
        );
        return success ? abi.decode(data, (uint8)) : 18;
    }

    /**
     * @dev Get price from Pyth network
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
     * Adds a charity organization to the contract.
     * @param charity The charity organization to add.
     */

    function addCharity(Charity charity) public onlyOwner {
        Charity.Category charityCategory = charity.charityCategory();
        address charityAddress = address(charity);

        uint8 categoryIndex = uint8(charityCategory);
        if (charityOrganizations[categoryIndex] != address(0)) {
            revert EcoNovaManager__CharityAlreadyExists();
        }

        charityOrganizations[categoryIndex] = charityAddress;
        charityLength++;
        emit CharityAdded(categoryIndex, charityAddress);
    }

    /**
     * Removes a charity organization from the contract.
     * @param charity The charity organization to remove.
     */
    function removeCharity(Charity charity) public onlyOwner {
        Charity.Category charityCategory = charity.charityCategory();
        address charityAddress = address(charity);

        uint8 categoryIndex = uint8(charityCategory);

        if (charityOrganizations[categoryIndex] != charityAddress) {
            revert EcoNovaManager__CharityNotFound();
        }

        delete charityOrganizations[categoryIndex];

        charityLength--;

        emit CharityRemoved(categoryIndex);
    }

    /**
     * @dev Validates the charity organization.
     * @param charityAddress The address of the charity organization.
     */
    function validateCharity(address charityAddress) public view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(charityAddress)
        }
        if (size == 0) {
            revert EcoNovaManager__InvalidCharityAddress();
        }

        (bool canWithdraw, bytes memory data) = charityAddress.staticcall(
            abi.encodeWithSignature("canWithdraw()")
        );

        if (!canWithdraw || (data.length > 0 && abi.decode(data, (bool)) == false)) {
            revert EcoNovaManager__CharityCannotWithdraw();
        }

        return true;
    }

    /**
     * @dev Donate ETH or ERC20 tokens to the foundation.
     * @param charityCategory The category of the charity organization.
     * @param token The address of the token to donate.
     * @param amountInUsd The amount in USD (assumed to have 2 decimals).
     */
    function donateToFoundation(
        Charity.Category charityCategory,
        address token,
        uint256 amountInUsd
    ) public payable nonReentrant {
        uint8 charityOrgIndex = uint8(charityCategory);
        if (charityOrganizations[charityOrgIndex] == address(0)) {
            revert EcoNovaManager__CharityNameNotFound();
        }

        address charityAddress = charityOrganizations[charityOrgIndex];

        if (amountInUsd == 0) {
            revert EcoNovaManager__CanNotBeZero();
        }

        if (!validateCharity(charityAddress)) {
            revert EcoNovaManager__InvalidCharityAddress();
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
            userDonationsOrgs[caller][charityOrgIndex] += msg.value;

            (bool success, ) = charityAddress.call{value: amountToSend}("");
            if (!success) {
                revert EcoNovaManager__SendingFailed();
            }
        } else {
            IERC20 erc20 = IERC20(token);
            uint256 balanceBefore = erc20.balanceOf(charityAddress);

            bool transferSuccess = erc20.transferFrom(msg.sender, charityAddress, amountToSend);

            if (!transferSuccess) {
                revert EcoNovaManager__SendingFailed();
            }

            uint256 balanceAfter = erc20.balanceOf(charityAddress);

            if (balanceAfter - balanceBefore != amountToSend) {
                revert EcoNovaManager__IncorrectBalance();
            }
        }

        emit PointsAdded(caller, userPoints[caller].points);
        emit Donated(caller, token, amountToSend, charityOrgIndex);
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

        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        // bytes32 ethSignedMessageHash = EthSign.getEthSignedMessageHash(messageHash);
        return ethSignedMessageHash;
    }

    /**
     * @dev Adds points signed by twitter bot to the user
     * @param pointToAdd points to add
     * @param userTwitterId the twitter id of the user
     * @param tweetId the tweet id to claim points for
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
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        if (userAddedTweets[userTwitterId][tweetId]) {
            revert EcoNovaManager__TweetIdAlreadyRecorderForUser();
        }

        if (usedHashes[messageHash]) {
            revert EcoNovaManager__HashAlreadyUsed();
        }

        if (ECDSA.recover(ethSignedMessageHash, signature) != botAddress) {
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

    /**
     * @notice Verifies a zero-knowledge proof for BMI health status and records the result.
     * @dev Uses a zk-SNARK proof to validate if the user's BMI is within a healthy range.
     * @param _pA - First part of the zk-SNARK proof.
     * @param _pB - Second part of the zk-SNARK proof (nested array for pairing checks).
     * @param _pC - Third part of the zk-SNARK proof.
     * @param _pubSignals - Public input signals for the proof (e.g., BMI threshold).
     */
    function checkBMIHealthy(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[2] calldata _pubSignals
    ) public {
        bool verified = i_groth16VerifierP3.verifyProof(_pA, _pB, _pC, _pubSignals);
        if (!verified) {
            revert EcoNovaManager__InvalidSignature();
        }
        userBMIHealthy[msg.sender] = verified;
        emit BMIRecorded(msg.sender, verified);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./EcoNovaToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "hardhat/console.sol";
import "./CustomToken.sol";
import "./Charity.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "./mocks/EndpointV2Mock.sol";

contract EcoNovaManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    /**
     * mappings
     */
    mapping(address => PointData) public userPoints;
    mapping(address tokenAddress => uint256 amount) public donations;
    mapping(address sender => mapping(address token => uint256 amount)) public userDonations;
    mapping(address sender => mapping(uint8 charity => mapping(address token => uint256 amount)))
        public userDonationsOrgs;
    mapping(bytes32 => bool) public usedHashes;
    mapping(uint256 => mapping(uint256 => bool)) public userAddedTweets;
    mapping(uint8 => address) public charityOrganizations;

    /**
     * constants
     */
    uint256 public constant POINT_BASIS = 35;
    uint256 public constant DONATION_POINT_PER_USD = POINT_BASIS * 2;
    uint256 public constant FIAT_DECIMALS = 10 ** 2;
    uint256 public constant SLIPPAGE_TOLERANCE_BPS = 200;
    uint256 public constant ONE_DAY = 60 * 60 * 60 * 24;
    address public constant NATIVE_TOKEN = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    address public constant WRAPPED_NATIVE_TOKEN =
        address(0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38);
    address public constant WETH = address(0x50c42dEAcD8Fc9773493ED674b675bE577f2634b);
    address public constant USDC = address(0x29219dd400f2Bf60E5a23d13Be72B486D4038894);

    /**
     * variables
     */
    uint256 public charityLength;
    address public botAddress;

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
    error EcoNovaManager__CharityNameCanNotBeNull();
    error EcoNovaManager__CharityAlreadyExists();
    error EcoNovaManager__CharityNotFound();
    error EcoNovaManager__IncorrectBalance();
    error EcoNovaManager__InvalidContractAddress();
    error EcoNovaManager__CharityDoesNotSupportAutomation();

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
        address _lzEndpoint
    ) Ownable(msg.sender) {
        i_ecoNovaToken = new EcoNovaToken(_lzEndpoint, msg.sender);
        botAddress = _botAddress;
        i_pyth = IPyth(oracleAddress);
        for (uint256 i = 0; i < _charity.length; i++) {
            addCharity(_charity[i]);
        }
        emit SetOracle(oracleAddress, oracleAddress);
    }

    /**
     * @dev Deploys a new token
     * @param name - name of the token
     * @param symbol - symbol of the token
     * @param initialSupply - initial supply of the token
     */
    function deployToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) external {
        if (initialSupply <= 0) {
            revert EcoNovaManager__CanNotBeZero();
        }
        CustomToken token = new CustomToken(name, symbol);
        token.mint(msg.sender, initialSupply * 10 ** token.decimals());
        token.transferOwnership(msg.sender);
        emit TokenCreated(address(token), name, symbol, initialSupply);
    }

    /**
     * @dev Converts USD amount to token amount based on oracle price data.
     * @param amountInUsd The amount in USD (assumed to have 2 decimals).
     * @return amountToSend The equivalent token amount.
     */
    function getUsdToTokenPrice(address token, uint256 amountInUsd) public view returns (uint256) {
        (uint256 priceOfTokenInUsd, uint8 priceDecimals) = getPricePyth(token);

        uint8 tokenDecimals = getTokenDecimals(token);

        uint256 amountToSendNumerator = amountInUsd *
            (10 ** tokenDecimals) *
            (10 ** priceDecimals);
        uint256 amountToSendDenominator = priceOfTokenInUsd;

        uint256 amountToSend = amountToSendNumerator / amountToSendDenominator;

        return amountToSend / FIAT_DECIMALS;
    }

    /**
     * @dev Get token decimals
     * @param token The address of the token.
     */
    function getTokenDecimals(address token) internal view returns (uint8) {
        if (token == NATIVE_TOKEN) {
            return 18;
        }

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
    function getPricePyth(address token) public view returns (uint256, uint8) {
        bytes32 priceFeedId = getPriceFeedFromToken(token);
        PythStructs.Price memory price = i_pyth.getPriceNoOlderThan(priceFeedId, ONE_DAY);
        return (
            uint256(uint64(price.price < 0 ? -price.price : price.price)),
            uint8(uint32(price.expo < 0 ? -price.expo : price.expo))
        );
    }

    /**
     * @dev Get price feed from token
     * @param token The address of the token.
     */
    function getPriceFeedFromToken(address token) private pure returns (bytes32) {
        if (token == NATIVE_TOKEN || token == WRAPPED_NATIVE_TOKEN) {
            return 0xf490b178d0c85683b7a0f2388b40af2e6f7c90cbe0f96b31f315f08d0e5a2d6d;
        } else if (token == WETH) {
            return 0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6;
        } else if (token == USDC) {
            return 0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a;
        }
        revert EcoNovaManager__ConversionNotAvailable();
    }

    /**
     * Adds a charity organization to the contract.
     * @param charity The charity organization to add.
     */

    function addCharity(Charity charity) public onlyOwner {
        Charity.Category charityCategory = charity.charityCategory();
        address charityAddress = address(charity);

        if (!validateCharity(charityAddress)) {
            revert EcoNovaManager__InvalidCharityAddress();
        }

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
    function removeCharity(Charity charity) external onlyOwner {
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
     * @dev Checks if the address is a contract.
     * @param _addr The address to check if it is a contract.
     */
    function isContract(address _addr) private view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }

    /**
     * @dev Validates the charity organization.
     * @param charityAddress The address of the charity organization.
     */
    function validateCharity(address charityAddress) public view returns (bool) {
        if (!isContract(charityAddress)) {
            revert EcoNovaManager__InvalidContractAddress();
        }

        (bool hasWithdraw, bytes memory data) = charityAddress.staticcall(
            abi.encodeWithSignature("canWithdraw()")
        );

        if (!hasWithdraw || (data.length > 0 && abi.decode(data, (bool)) == false)) {
            revert EcoNovaManager__CharityCannotWithdraw();
        }

        (bool hasChecker, bytes memory checkerData) = charityAddress.staticcall(
            abi.encodeWithSignature("checker()")
        );

        if (!hasChecker) {
            revert EcoNovaManager__CharityDoesNotSupportAutomation();
        }

        if (checkerData.length > 0) {
            abi.decode(checkerData, (bool, bytes));
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
    ) external payable nonReentrant {
        uint8 charityOrgIndex = uint8(charityCategory);
        if (charityOrganizations[charityOrgIndex] == address(0)) {
            revert EcoNovaManager__CharityNameNotFound();
        }

        address charityAddress = charityOrganizations[charityOrgIndex];

        if (amountInUsd == 0) {
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

        donations[token] += amountToSend;
        userDonations[caller][token] += amountToSend;
        userDonationsOrgs[caller][charityOrgIndex][token] += amountToSend;

        if (token == NATIVE_TOKEN) {
            if (msg.value < minTokenAmount || msg.value > maxTokenAmount) {
                revert EcoNovaManager__IncorrectETHAmount();
            }

            (bool success, ) = charityAddress.call{value: amountToSend}("");
            if (!success) {
                revert EcoNovaManager__SendingFailed();
            }
        } else {
            IERC20(token).safeTransferFrom(msg.sender, charityAddress, amountToSend);
        }

        emit PointsAdded(caller, userPoints[caller].points);
        emit Donated(caller, token, amountToSend, charityOrgIndex);
    }

    /**
     * @dev Test the hash based on the parameters
     * @param pointToAdd points to add
     * @param userTwitterId the twitter id of the user
     * @param tweetId the tweet id to claim points for
     */
    function testHash(
        uint256 pointToAdd,
        uint256 userTwitterId,
        uint256 tweetId,
        bytes memory
    ) external view returns (bytes32 message) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(msg.sender, pointToAdd, userTwitterId, tweetId, block.chainid)
        );

        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
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
    ) external {
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
    function redeemPoints(uint256 point) external returns (bool success) {
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
    function updateBotAddress(address _newBotAddress) external onlyOwner {
        if (_newBotAddress == address(0)) {
            revert EcoNovaManager__AddressCannotBeZero();
        }
        address oldBotAddress = botAddress;
        botAddress = _newBotAddress;
        emit BotAddressUpdated(oldBotAddress, _newBotAddress);
    }
}

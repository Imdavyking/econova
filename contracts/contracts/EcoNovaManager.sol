// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./EcoNovaToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@orochi-network/contracts/IOrocleAggregatorV2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EcoNovaManager is Ownable {
    /**
     * mappings
     */
    mapping(address => PointData) public userPoints;
    mapping(address => uint256) public donations;
    mapping(address => uint256) public userDonations;

    /**
     * constants
     */
    uint256 public constant POINT_BASIS = 35;
    uint256 public constant FIAT_DECIMALS = 10 ** 2;
    address public constant ETH_ADDRESS = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    uint256 public constant SLIPPAGE_TOLERANCE_BPS = 200;

    /**
     * immutable variables
     */
    EcoNovaToken public immutable i_ecoNovaToken;
    bytes20 public immutable i_ethIdentifier = "ETH";
    IOrocleAggregatorV2 private i_orocle;

    /**
     * error messages
     */
    error EcoNovaManager__InsufficientPoints();
    error EcoNovaManager__ConversionNotAvailable();
    error EcoNovaManager__SendingFailed();
    error EcoNovaManager__IncorrectETHAmount();
    error EcoNovaManager__InsufficientBalance();

    /**
     * events
     */
    event PointsAdded(address indexed user, uint256 points);
    event PointsRedeemed(address indexed user, uint256 points);
    event SetOrocle(address indexed oldOrocle, address indexed newOrocle);
    event Donated(address indexed user, address indexed token, uint256 amount);
    event DonationWithdrawed(address indexed user, address indexed token, uint256 amount);

    /**
     * structs
     */
    struct PointData {
        uint256 points;
        uint256 updatedTimeStamp;
        uint256 createdTimeStamp;
        address user;
    }

    constructor(address orocleAddress) Ownable(msg.sender) {
        i_ecoNovaToken = new EcoNovaToken();
        i_orocle = IOrocleAggregatorV2(orocleAddress);
        emit SetOrocle(address(i_orocle), orocleAddress);
    }

    /**
     * @dev Converts USD amount to token amount based on oracle price data.
     * @param amountInUsd The amount in USD (assumed to have 2 decimals).
     * @return amountToSend The equivalent token amount.
     */
    function getUsdToTokenPrice(address token, uint256 amountInUsd) public view returns (uint256) {
        if (token == ETH_ADDRESS) {
            uint256 priceOfTokenInUsd = _getPrice(i_ethIdentifier);

            uint8 tokenDecimals = 18;
            uint8 priceDecimals = 18;

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
     * @param identifier The identifier of the token.
     * @return price
     */
    function _getPrice(bytes20 identifier) internal view returns (uint256) {
        return uint256(i_orocle.getLatestData(1, identifier));
    }

    /**
     * @dev Donate ETH or ERC20 tokens to the foundation.
     * @param token The address of the token to donate.
     * @param amountInUsd The amount in USD (assumed to have 2 decimals).
     */
    function donateToFoundation(address token, uint256 amountInUsd) public payable {
        address caller = msg.sender;
        uint256 amountToSend = getUsdToTokenPrice(token, amountInUsd);

        uint256 minTokenAmount = (amountToSend * (10000 - SLIPPAGE_TOLERANCE_BPS)) / 10000;
        uint256 maxTokenAmount = (amountToSend * (10000 + SLIPPAGE_TOLERANCE_BPS)) / 10000;

        if (token == ETH_ADDRESS) {
            if (msg.value < minTokenAmount || msg.value > maxTokenAmount) {
                revert EcoNovaManager__IncorrectETHAmount();
            }
            donations[ETH_ADDRESS] += msg.value;
            userDonations[caller] += msg.value;
        }

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

    /**
     * @dev Add points to the user based on the weight of the waste
     * @param weightInGrams weight in grams of the waste
     */
    function addPointFromWeight(uint256 weightInGrams) public {
        // accumulate points for the user based on the weight of the waste
        uint256 points = weightInGrams * POINT_BASIS;

        PointData memory userPointData = userPoints[msg.sender];

        // check if the user already has points
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
    function redeemCode(uint256 point) public returns (bool success) {
        // withdraw points from the user
        if (userPoints[msg.sender].points == 0) {
            revert EcoNovaManager__InsufficientPoints();
        }
        if (userPoints[msg.sender].points < point) {
            revert EcoNovaManager__InsufficientPoints();
        }
        userPoints[msg.sender].points -= point;
        // convert to ERC20 token
        i_ecoNovaToken.mint(msg.sender, point * 10 ** i_ecoNovaToken.decimals());
        emit PointsRedeemed(msg.sender, point);
        emit PointsAdded(msg.sender, userPoints[msg.sender].points);
        return true;
    }
}

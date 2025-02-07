// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Charity is Ownable, ReentrancyGuard {
    /** state variables */
    bool public canWithdrawFunds = true;
    Category public charityCategory;
    /** constants */
    address public constant ETH_ADDRESS = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    /** errors */
    error Charity__InsufficientBalance();
    error Charity__SendingFailed();
    error Charity__WithdrawalDisabled();

    enum Category {
        Education,
        Health,
        Environment,
        Animals,
        HumanRights,
        Poverty,
        Other
    }

    /** events */
    event DonationWithdrawn(address indexed organization, address indexed token, uint256 amount);

    constructor(Category _category) Ownable(msg.sender) {
        charityCategory = _category;
    }

    /**
     * @dev Check if the contract can withdraw funds.
     */
    function canWithdraw() public view returns (bool) {
        return canWithdrawFunds;
    }

    /**
     * @dev Set the status of the contract to withdraw funds.
     * @param status The status to set.
     */

    function setCanWithdraw(bool status) public onlyOwner {
        canWithdrawFunds = status;
    }

    /**
     * @dev Check the balance of the contract.
     * @param token The address of the token to check the balance of.
     */
    function balanceOf(address token) public view returns (uint256) {
        if (token == ETH_ADDRESS) {
            return address(this).balance;
        } else {
            return IERC20(token).balanceOf(address(this));
        }
    }

    /**
     * @dev Withdraw the donation from the contract.
     * @param token The address of the token to withdraw.
     * @param amount The amount to withdraw.
     * @param organization The address to send the funds to.
     */
    function withdrawToOrganization(
        address token,
        uint256 amount,
        address organization
    ) public onlyOwner nonReentrant {
        if (!canWithdrawFunds) {
            revert Charity__WithdrawalDisabled();
        }
        if (token == ETH_ADDRESS) {
            if (address(this).balance < amount) {
                revert Charity__SendingFailed();
            }

            (bool success, ) = organization.call{value: amount}("");
            if (!success) {
                revert Charity__SendingFailed();
            }
        } else {
            bool sendSuccess = IERC20(token).transfer(organization, amount);
            if (!sendSuccess) {
                revert Charity__SendingFailed();
            }
        }
        emit DonationWithdrawn(organization, token, amount);
    }

    /**
     * @dev Fallback function to receive ETH donations.
     */
    receive() external payable {}
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Charity is Ownable, ReentrancyGuard {
    /** state variables */
    bool public canWithdrawFunds = true;
    Category public category;
    string public name;
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
    event DonationWithdrawed(address indexed user, address indexed token, uint256 amount);

    constructor(Category _category, string memory _name) Ownable(msg.sender) {
        category = _category;
        name = _name;
    }

    function canWithdraw() public view returns (bool) {
        return canWithdrawFunds;
    }

    function setCanWithdraw(bool status) public onlyOwner {
        canWithdrawFunds = status;
    }

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
     */
    function withdrawDonation(address token, uint256 amount) public onlyOwner nonReentrant {
        if (!canWithdrawFunds) {
            revert Charity__WithdrawalDisabled();
        }
        if (token == ETH_ADDRESS) {
            if (address(this).balance < amount) {
                revert Charity__SendingFailed();
            }

            (bool success, ) = owner().call{value: amount}("");
            if (!success) {
                revert Charity__SendingFailed();
            }
        } else {
            IERC20(token).transfer(owner(), amount);
        }
        emit DonationWithdrawed(owner(), token, amount);
    }

    receive() external payable {}
}

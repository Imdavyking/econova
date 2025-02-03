// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Charity is Ownable {
    /** state variables */
    bool public canWithdrawFunds = true;
    /** constants */
    address public constant ETH_ADDRESS = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    /** errors */
    error Charity__InsufficientBalance();
    error Charity__SendingFailed();

    /** events */
    event DonationWithdrawed(address indexed user, address indexed token, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function canWithdraw() public view returns (bool) {
        return canWithdrawFunds;
    }

    /**
     * @dev Withdraw the donation from the contract.
     * @param token The address of the token to withdraw.
     * @param amount The amount to withdraw.
     */
    function withdrawDonation(address token, uint256 amount) public onlyOwner {
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
}

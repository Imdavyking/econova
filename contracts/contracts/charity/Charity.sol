// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Charity is Ownable, ReentrancyGuard {
    /** state variables */
    bool public canWithdrawFunds = true;
    Category public charityCategory;
    address public automationBot = address(0);
    /** constants */
    address public constant ETH_ADDRESS = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    /** errors */
    error Charity__InsufficientBalance();
    error Charity__SendingFailed();
    error Charity__WithdrawalDisabled();
    error Charity__TokenAlreadyWhitelisted();
    error Charity__TokenNotWhitelisted();
    error Charity__MustBeAutomatedOrOwner(address caller);

    /**
     * mappings
     */
    mapping(address => bool) private whitelistedTokens;

    /**
     * arrays
     */
    address[] private tokenList;

    enum Category {
        Education,
        Health,
        Environment,
        Animals,
        HumanRights,
        Poverty,
        Other
    }

    modifier onlyAutomationOrOwner() {
        if (msg.sender != automationBot && msg.sender != owner()) {
            revert Charity__MustBeAutomatedOrOwner(msg.sender);
        }
        _;
    }

    /** events */
    event DonationWithdrawn(address indexed organization, address indexed token, uint256 amount);
    event TokenWhitelisted(address token);
    event TokenRemoved(address token);

    constructor(Category _category) Ownable(msg.sender) {
        charityCategory = _category;
    }

    /**
     * @dev Set the automation bot address.
     * @param _automation address of the automation bot
     */
    function setAutomationBot(address _automation) external onlyOwner {
        automationBot = _automation;
    }

    /**
     * @dev Check if the contract can withdraw funds.
     */
    function canWithdraw() external view returns (bool) {
        return canWithdrawFunds;
    }

    /**
     * @dev Set the status of the contract to withdraw funds.
     * @param status The status to set.
     */

    function setCanWithdraw(bool status) external onlyOwner {
        canWithdrawFunds = status;
    }

    /**
     * @dev Adds a token to the whitelist.
     * @param token The address of the token to add.
     */
    function addWhitelistedToken(address token) external onlyOwner {
        if (whitelistedTokens[token]) {
            revert Charity__TokenAlreadyWhitelisted();
        }

        whitelistedTokens[token] = true;
        tokenList.push(token);

        emit TokenWhitelisted(token);
    }

    /**
     * @dev Removes a token from the whitelist.
     * @param token The address of the token to remove.
     */
    function removeWhitelistedToken(address token) external onlyOwner {
        if (!whitelistedTokens[token]) {
            revert Charity__TokenNotWhitelisted();
        }

        whitelistedTokens[token] = false;

        for (uint256 i = 0; i < tokenList.length; i++) {
            if (tokenList[i] == token) {
                tokenList[i] = tokenList[tokenList.length - 1];
                tokenList.pop();
                break;
            }
        }

        emit TokenRemoved(token);
    }

    /**
     * @dev Returns the list of whitelisted ERC-20 tokens.
     */
    function getWhitelistedTokens() public view returns (address[] memory) {
        return tokenList;
    }

    /**
     * Automates funds distribution to the organization.
     * @return canExec - whether the contract can execute the withdrawal
     * @return execPayload - the payload to execute the withdrawal
     */
    function checker() external view returns (bool canExec, bytes memory execPayload) {
        address organization = owner();
        uint256 ethBalance = address(this).balance;

        if (!canWithdrawFunds) {
            return (false, abi.encode("Withdrawals Disabled"));
        }

        if (ethBalance > 0) {
            return (
                true,
                abi.encodeCall(
                    this.withdrawToOrganization,
                    (ETH_ADDRESS, ethBalance, organization)
                )
            );
        }

        address[] memory tokens = getWhitelistedTokens();
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 tokenBalance = IERC20(tokens[i]).balanceOf(address(this));
            if (tokenBalance > 0) {
                return (
                    true,
                    abi.encodeCall(
                        this.withdrawToOrganization,
                        (tokens[i], tokenBalance, organization)
                    )
                );
            }
        }

        return (false, abi.encode("No Funds Available"));
    }

    /**
     * @dev Check the balance of the contract.
     * @param token The address of the token to check the balance of.
     * @return The balance of the contract.
     */
    function balanceOf(address token) external view returns (uint256) {
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
    ) external onlyAutomationOrOwner nonReentrant {
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
            if (!whitelistedTokens[token]) {
                revert Charity__TokenNotWhitelisted();
            }
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

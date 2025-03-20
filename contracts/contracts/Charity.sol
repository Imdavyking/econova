// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IGelatoChecker} from "./interfaces/IGelatoChecker.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ICharity} from "./interfaces/ICharity.sol";
import {ICharityDao} from "./interfaces/ICharityDao.sol";

contract Charity is Ownable, ReentrancyGuard, IGelatoChecker, ICharity, ICharityDao {
    using SafeERC20 for IERC20;
    /** state variables */
    bool public canWithdrawFunds = true;
    Category public charityCategory;
    address public automationBot = address(0);

    /** constants */
    address public constant NATIVE_TOKEN = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    /**
     * mappings
     */
    mapping(address => bool) public whitelistedTokens;
    mapping(address => bool) public organizationExists;

    /**
     * arrays
     */
    address[] public tokenList;
    address[] public organizations;

    enum Category {
        Education,
        Health,
        Environment,
        Animals,
        HumanRights,
        Poverty,
        Other
    }

    modifier onlyAutomationBot() {
        if (msg.sender != automationBot && msg.sender != owner()) {
            revert Charity__MustBeAutomatedOrOwner(msg.sender);
        }
        _;
    }

    /** events */
    event DonationWithdrawn(address indexed organization, address indexed token, uint256 amount);
    event TokenWhitelisted(address token);
    event TokenRemoved(address token);
    event OrganizationAdded(address indexed organization);
    event OrganizationRemoved(address indexed organization);

    constructor(Category _category, address _automationBot) Ownable(msg.sender) {
        charityCategory = _category;
        automationBot = _automationBot;
        if (automationBot == address(0)) {
            revert Charity__GovernorCanNotBeZeroAddress();
        }
    }

    /**
     * @dev Set the automation bot address.
     * @param _automation address of the automation bot
     */
    function setAutomationBot(address _automation) external onlyAutomationBot {
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

    function setCanWithdraw(bool status) external onlyAutomationBot {
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
     * @dev Adds an organization to the list of organizations.
     * @param organization The address of the organization to add.
     */
    function addOrganization(address organization) external onlyOwner {
        if (organizationExists[organization]) {
            revert Charity__OrganizationAlreadyExists();
        }
        organizationExists[organization] = true;
        organizations.push(organization);
        emit OrganizationAdded(organization);
    }

    /**
     * @dev Removes an organization from the list of organizations.
     * @param organization The address of the organization to remove.
     */
    function removeOrganization(address organization) external onlyOwner {
        if (!organizationExists[organization]) {
            revert Charity__OrganizationNotFound(organization);
        }
        organizationExists[organization] = false;
        uint256 length = organizations.length;
        for (uint256 i = 0; i < length; i++) {
            if (organizations[i] == organization) {
                organizations[i] = organizations[length - 1];
                organizations.pop();
                break;
            }
        }
        emit OrganizationRemoved(organization);
    }

    /**
     * @dev Returns the list of organizations.
     */

    function getOrganizations() public view returns (address[] memory) {
        return organizations;
    }

    /**
     * Automates funds distribution to the organization.
     * @return canExec - whether the contract can execute the withdrawal
     * @return execPayload - the payload to execute the withdrawal
     */
    function checker() external view returns (bool canExec, bytes memory execPayload) {
        uint256 orgCount = organizations.length;
        if (orgCount == 0) {
            return (false, abi.encode("No Organizations Available"));
        }

        if (!canWithdrawFunds) {
            return (false, abi.encode("Withdrawals Disabled"));
        }

        uint256 ethBalance = address(this).balance;
        address[] memory tokens = tokenList;

        if (ethBalance > 0) {
            return (
                true,
                abi.encodeCall(
                    ICharity.withdrawToOrganization,
                    (NATIVE_TOKEN, ethBalance, organizations)
                )
            );
        }

        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 tokenBalance = IERC20(tokens[i]).balanceOf(address(this));
            if (tokenBalance > 0) {
                return (
                    true,
                    abi.encodeCall(
                        ICharity.withdrawToOrganization,
                        (tokens[i], tokenBalance, organizations)
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
        return
            token == NATIVE_TOKEN ? address(this).balance : IERC20(token).balanceOf(address(this));
    }

    /**
     * @dev Withdraw the donation from the contract.
     * @param token The address of the token to withdraw.
     * @param amount The amount to withdraw.
     * @param orgs The list of organizations to withdraw to.
     */
    function withdrawToOrganization(
        address token,
        uint256 amount,
        address[] memory orgs
    ) external onlyAutomationBot nonReentrant {
        if (!canWithdrawFunds) {
            revert Charity__WithdrawalDisabled();
        }
        if (token != NATIVE_TOKEN && !whitelistedTokens[token]) {
            revert Charity__TokenNotWhitelisted();
        }
        uint256 orgCount = orgs.length;
        if (orgCount == 0) {
            revert Charity__NoOrganizationsYet();
        }
        uint256 share = amount / orgCount;
        for (uint256 i = 0; i < orgCount; i++) {
            if (!organizationExists[orgs[i]]) {
                revert Charity__OrganizationNotFound(orgs[i]);
            }
        }
        for (uint256 i = 0; i < orgCount; i++) {
            if (token == NATIVE_TOKEN) {
                (bool success, ) = orgs[i].call{value: share}("");
                if (!success) {
                    revert Charity__SendingFailed();
                }
            } else {
                IERC20(token).safeTransfer(orgs[i], share);
            }
            emit DonationWithdrawn(orgs[i], token, share);
        }
    }

    /**
     * @dev Fallback function to receive ETH donations.
     */

    receive() external payable {}
}

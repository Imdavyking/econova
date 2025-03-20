// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface ICharityDao {
    /** errors */
    error Charity__InsufficientBalance();
    error Charity__SendingFailed();
    error Charity__WithdrawalDisabled();
    error Charity__TokenAlreadyWhitelisted();
    error Charity__TokenNotWhitelisted();
    error Charity__MustBeAutomatedOrOwner(address caller);
    error Charity__OrganizationAlreadyExists();
    error Charity__OrganizationNotFound();
    error Charity__OnlyGovernor();
    error Charity__GovernorCanNotBeZeroAddress();
    error Charity__NoOrganizationsYet();

    /** functions */

    function addWhitelistedToken(address token) external;

    function removeWhitelistedToken(address token) external;

    function addOrganization(address organization) external;

    function removeOrganization(address organization) external;
}

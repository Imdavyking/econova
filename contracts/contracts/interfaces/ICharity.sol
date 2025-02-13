// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

interface ICharity {
    function withdrawToOrganization(address token, uint256 amount, address organization) external;
}

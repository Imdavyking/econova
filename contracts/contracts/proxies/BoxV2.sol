// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract BoxV2 is UUPSUpgradeable, OwnableUpgradeable {
    uint256 internal _value;

    function store(uint256 value) public onlyOwner {
        _value = value;
    }

    function retrieve() public view returns (uint256) {
        return _value;
    }

    function version() public pure returns (string memory) {
        return "V2";
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}

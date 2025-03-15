// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract BoxV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 internal _value;

    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    function store(uint256 value) public onlyOwner {
        _value = value;
    }

    function retrieve() public view returns (uint256) {
        return _value;
    }

    function version() public pure returns (string memory) {
        return "V1";
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}

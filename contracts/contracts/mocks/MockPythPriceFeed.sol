// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract MockPythPriceFeed {
    function getPriceNoOlderThan(
        bytes32,
        uint age
    ) external view returns (PythStructs.Price memory price) {
        price = PythStructs.Price({
            price: 0,
            conf: 0,
            expo: 0,
            publishTime: uint(block.timestamp - age)
        });
    }
}

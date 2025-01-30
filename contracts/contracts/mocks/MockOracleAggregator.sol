// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract MockOracleAggregator {
    uint256 private mockPrice = 3100 * 10 ** 18;

    function getLatestData(uint32, bytes20) external view returns (bytes32) {
        return bytes32(mockPrice);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EcoNovaToken is ERC20 {
    address public immutable OWNER;
    uint256 public constant MAX_SUPPLY = 21_000_000 * 10 ** 18; // 1 million tokens with 18 decimals

    error EcoNovaToken__NotOwner();
    error EcoNovaToken__MaxSupplyExceeded();

    constructor() ERC20("EcoNovaToken", "ENT") {
        OWNER = msg.sender;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != OWNER) {
            revert EcoNovaToken__NotOwner();
        }
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert EcoNovaToken__MaxSupplyExceeded();
        }
        _mint(to, amount);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EcoNovaToken is ERC20 {
    address public immutable OWNER;
    uint256 public immutable MAX_SUPPLY = 21_000_000 * 10 ** decimals();

    error EcoNovaToken__NotOwner();
    error EcoNovaToken__MaxSupplyExceeded();

    constructor() ERC20("EcoNovaToken", "ENT") {
        OWNER = msg.sender;
    }

    /**
     * @dev Mint tokens
     * @param to - the address to mint tokens to
     * @param amount - the amount of tokens to mint
     */

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

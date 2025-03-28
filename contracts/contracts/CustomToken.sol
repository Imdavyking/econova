// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomToken is ERC20, Ownable {
    error CustomToken__NotOwner();
    error CustomToken__MaxSupplyExceeded();

    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {}

    /**
     * @dev Mint tokens
     * @param to - the address to mint tokens to
     * @param amount - the amount of tokens to mint
     */

    function mint(address to, uint256 amount) external onlyOwner {
        uint256 MAX_SUPPLY = 21_000_000 * 10 ** decimals();
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert CustomToken__MaxSupplyExceeded();
        }
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens
     * @param amount - the amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

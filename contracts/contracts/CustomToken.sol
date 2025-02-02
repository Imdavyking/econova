// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CustomToken is ERC20 {
    address public immutable OWNER;
    address public immutable DEPLOYER;

    error CustomToken__NotOwner();
    error CustomToken__MaxSupplyExceeded();

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) {
        OWNER = owner;
        DEPLOYER = msg.sender;
        _mint(msg.sender, initialSupply * (10 ** uint256(decimals()))); // Mint tokens with correct decimals
    }

    /**
     * @dev Mint tokens
     * @param to - the address to mint tokens to
     * @param amount - the amount of tokens to mint
     */

    function mint(address to, uint256 amount) external {
        if (msg.sender != OWNER) {
            revert CustomToken__NotOwner();
        }
        uint256 MAX_SUPPLY = 21_000_000 * 10 ** decimals(); // 1 million tokens with 18 decimals
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert CustomToken__MaxSupplyExceeded();
        }
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

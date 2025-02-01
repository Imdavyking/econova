// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CustomToken is ERC20 {
    address public immutable OWNER;
    uint8 public DECIMALS;

    error CustomToken__NotOwner();
    error CustomToken__MaxSupplyExceeded();

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        OWNER = msg.sender;
        DECIMALS = decimals_;
        _mint(msg.sender, initialSupply * (10 ** uint256(DECIMALS))); // Mint tokens with correct decimals
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     */
    function decimals() public view override returns (uint8) {
        return DECIMALS;
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

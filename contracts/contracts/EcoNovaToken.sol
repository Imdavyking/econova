// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OFT} from "@layerzerolabs/oft-evm/contracts/OFT.sol";

contract EcoNovaToken is OFT {
    address public immutable OWNER;
    uint256 public immutable MAX_SUPPLY = 21_000_000 * 10 ** decimals();

    error EcoNovaToken__NotOwner();
    error EcoNovaToken__MaxSupplyExceeded();

    constructor(
        address lzEndpoint
    ) OFT("EcoNovaToken", "ENT", lzEndpoint, msg.sender) Ownable(msg.sender) {
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

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OFT} from "@layerzerolabs/oft-evm/contracts/OFT.sol";

contract EcoNovaToken is OFT {
    address public immutable DEPLOYER;
    uint256 public immutable MAX_SUPPLY = 21_000_000 * 10 ** decimals();

    error EcoNovaToken__NotDeployerOrOwner();
    error EcoNovaToken__MaxSupplyExceeded();

    modifier deployerOrOwner() {
        if (msg.sender != owner() && msg.sender != DEPLOYER) {
            revert EcoNovaToken__NotDeployerOrOwner();
        }
        _;
    }

    constructor(
        address lzEndpoint,
        address delegate
    ) OFT("EcoNovaToken", "ENT", lzEndpoint, delegate) Ownable(delegate) {
        DEPLOYER = msg.sender;
    }

    /**
     * @dev Mint tokens
     * @param to - the address to mint tokens to
     * @param amount - the amount of tokens to mint
     */

    function mint(address to, uint256 amount) external deployerOrOwner {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert EcoNovaToken__MaxSupplyExceeded();
        }
        _mint(to, amount);
    }
}

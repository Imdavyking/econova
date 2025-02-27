// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OFT} from "@layerzerolabs/oft-evm/contracts/OFT.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EcoNovaToken is OFT, ERC20Votes {
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
    )
        OFT("EcoNovaToken", "ENT", lzEndpoint, delegate)
        Ownable(delegate)
        EIP712("EcoNovaToken", "1")
    {
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

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }
    /**
    //  * @dev Move voting power when tokens are transferred.
    //  *
    //  * Emits a {IVotes-DelegateVotesChanged} event.
    //  */
    // function _update(address from, address to, uint256 value) internal virtual override {
    //     super._update(from, to, value);
    //     if (from == address(0)) {
    //         uint256 supply = totalSupply();
    //         uint256 cap = _maxSupply();
    //         if (supply > cap) {
    //             revert ERC20ExceededSafeSupply(supply, cap);
    //         }
    //     }
    //     _transferVotingUnits(from, to, value);
    // }
}

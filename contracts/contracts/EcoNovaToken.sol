// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OFT} from "@layerzerolabs/oft-evm/contracts/OFT.sol";
import {Votes} from "@openzeppelin/contracts/governance/utils/Votes.sol";
import {Checkpoints} from "@openzeppelin/contracts/utils/structs/Checkpoints.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract EcoNovaToken is OFT, Votes {
    address public immutable DEPLOYER;
    uint256 public immutable MAX_SUPPLY = 21_000_000 * 10 ** decimals();

    error EcoNovaToken__NotDeployerOrOwner();
    error EcoNovaToken__MaxSupplyExceeded();
    error ERC20ExceededSafeSupply(uint256 increasedSupply, uint256 cap);

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

    /**
     * @dev Maximum token supply. Defaults to `type(uint208).max` (2^208^ - 1).
     *
     * This maximum is enforced in {_update}. It limits the total supply of the token, which is otherwise a uint256,
     * so that checkpoints can be stored in the Trace208 structure used by {Votes}. Increasing this value will not
     * remove the underlying limitation, and will cause {_update} to fail because of a math overflow in
     * {Votes-_transferVotingUnits}. An override could be used to further restrict the total supply (to a lower value) if
     * additional logic requires it. When resolving override conflicts on this function, the minimum should be
     * returned.
     */
    function _maxSupply() internal view virtual returns (uint256) {
        return MAX_SUPPLY;
    }

    /**
     * @dev Move voting power when tokens are transferred.
     *
     * Emits a {IVotes-DelegateVotesChanged} event.
     */
    function _update(address from, address to, uint256 value) internal virtual override {
        super._update(from, to, value);
        if (from == address(0)) {
            uint256 supply = totalSupply();
            uint256 cap = _maxSupply();
            if (supply > cap) {
                revert ERC20ExceededSafeSupply(supply, cap);
            }
        }
        _transferVotingUnits(from, to, value);
    }

    /**
     * @dev Returns the voting units of an `account`.
     *
     * WARNING: Overriding this function may compromise the internal vote accounting.
     * `ERC20Votes` assumes tokens map to voting units 1:1 and this is not easy to change.
     */
    function _getVotingUnits(address account) internal view virtual override returns (uint256) {
        return balanceOf(account);
    }

    /**
     * @dev Get number of checkpoints for `account`.
     */
    function numCheckpoints(address account) public view virtual returns (uint32) {
        return _numCheckpoints(account);
    }

    /**
     * @dev Get the `pos`-th checkpoint for `account`.
     */
    function checkpoints(
        address account,
        uint32 pos
    ) public view virtual returns (Checkpoints.Checkpoint208 memory) {
        return _checkpoints(account, pos);
    }
}

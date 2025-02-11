// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract EcoNovaCourseNFT is ERC721URIStorage {
    /**
     * variables
     */
    uint256 public tokenCounter;
    bytes32 public immutable root;

    /**
     * enums
     */
    enum Level {
        Beginner,
        Intermediate,
        Advanced
    }

    /**
     * mappings
     */
    mapping(address => mapping(Level => bool)) public hasCompletedLevel;
    mapping(address => mapping(Level => bool)) public hasClaimedNFT;

    /**
     * events
     */
    event NFTClaimed(address indexed user, Level level, uint256 tokenId);

    /**
     * errors
     */
    error EcoNovaCourseNFT__LevelAlreadyCompleted();
    error EcoNovaCourseNFT__NFTAlreadyClaimed();
    error EcoNovaCourseNFT__LevelNotCompleted();
    error EcoNovaCourseNFT__InvalidProof();

    constructor(bytes32 merkleroot) ERC721("EcoNovaCourseNFT", "ECNFT") {
        tokenCounter = 1;
        root = merkleroot;
    }

    /**
     * @notice Mark a course completion for a user
     * @param user - the user to mark the completion for
     * @param level - the level of the course
     * @param proof - the Merkle proof for the user and level
     */
    function markCourseCompletion(address user, Level level, bytes32[] memory proof) external {
        bool isProofValid = MerkleProof.verify(proof, root, _leaf(user, level));
        if (!isProofValid) {
            revert EcoNovaCourseNFT__InvalidProof();
        }
        if (hasCompletedLevel[user][level]) {
            revert EcoNovaCourseNFT__LevelAlreadyCompleted();
        }
        hasCompletedLevel[user][level] = true;
    }

    /**
     * @notice Get the leaf for a user and level
     * @param user - the user to mark the completion for
     * @param level - the level of the course
     */
    function _leaf(address user, Level level) internal pure returns (bytes32) {
        // prevent second preimage attack
        return keccak256(bytes.concat(keccak256(abi.encodePacked(user, level))));
    }

    /**
     * @notice Claim an NFT for a given level
     * @param level - the level of the course
     * @param tokenURI - the URI for the NFT
     */
    function claimNFT(Level level, string memory tokenURI) external {
        if (!hasCompletedLevel[msg.sender][level]) {
            revert EcoNovaCourseNFT__LevelNotCompleted();
        }

        if (hasClaimedNFT[msg.sender][level]) {
            revert EcoNovaCourseNFT__NFTAlreadyClaimed();
        }

        uint256 newTokenId = tokenCounter;
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        hasClaimedNFT[msg.sender][level] = true;
        tokenCounter++;

        emit NFTClaimed(msg.sender, level, newTokenId);
    }
}

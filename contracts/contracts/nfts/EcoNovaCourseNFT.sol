// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract EcoNovaCourseNFT is ERC721URIStorage {
    /**
     * variables
     */
    uint256 public tokenCounter;

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
    mapping(address => mapping(Level => bool)) public hasClaimedNFT;
    mapping(Level => string) public levelTokenURIs;
    mapping(Level => bytes32) private merkleRoots; // Separate Merkle roots per level
    mapping(uint256 => string) public tokenMetadata; // Store additional NFT metadata

    /**
     * events
     */
    event NFTClaimed(address indexed user, Level level, uint256 tokenId);
    event BatchNFTClaimed(address indexed user, Level[] levels, uint256[] tokenIds);

    /**
     * errors
     */
    error EcoNovaCourseNFT__NFTAlreadyClaimed();
    error EcoNovaCourseNFT__InvalidProof();

    constructor(
        bytes32[3] memory roots,
        string[3] memory uris
    ) ERC721("EcoNovaCourseNFT", "ECNFT") {
        tokenCounter = 1;
        merkleRoots[Level.Beginner] = roots[0];
        merkleRoots[Level.Intermediate] = roots[1];
        merkleRoots[Level.Advanced] = roots[2];

        levelTokenURIs[Level.Beginner] = uris[0];
        levelTokenURIs[Level.Intermediate] = uris[1];
        levelTokenURIs[Level.Advanced] = uris[2];
    }

    /**
     * @notice Verify the Merkle proof for msg.sender and level (internal to save gas)
     * @param level - the level of the course
     * @param proof - the Merkle proof
     */
    function _verifyProof(Level level, bytes32[] memory proof) internal view returns (bool) {
        return MerkleProof.verify(proof, merkleRoots[level], _leaf(msg.sender, level));
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
     * @notice Claim an NFT for completing a course
     * @param level - the level of the course
     * @param proof - the Merkle proof
     * @param metadata - additional metadata for the NFT
     */
    function claimNFT(Level level, bytes32[] memory proof, string memory metadata) external {
        if (hasClaimedNFT[msg.sender][level]) {
            revert EcoNovaCourseNFT__NFTAlreadyClaimed();
        }

        if (!_verifyProof(level, proof)) {
            revert EcoNovaCourseNFT__InvalidProof();
        }

        uint256 newTokenId = tokenCounter;
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, levelTokenURIs[level]);

        hasClaimedNFT[msg.sender][level] = true;
        tokenMetadata[newTokenId] = metadata;
        tokenCounter++;

        emit NFTClaimed(msg.sender, level, newTokenId);
    }

    /**
     * @notice Claim multiple NFTs for completing multiple course levels
     * @param levels - the course levels
     * @param proofs - the Merkle proofs
     * @param metadata - additional metadata for each NFT
     */
    function batchClaimNFT(
        Level[] memory levels,
        bytes32[][] memory proofs,
        string[] memory metadata
    ) external {
        require(
            levels.length == proofs.length && levels.length == metadata.length,
            "Mismatched array lengths"
        );

        uint256[] memory tokenIds = new uint256[](levels.length);

        for (uint256 i = 0; i < levels.length; i++) {
            if (!_verifyProof(levels[i], proofs[i])) {
                revert EcoNovaCourseNFT__InvalidProof();
            }

            if (hasClaimedNFT[msg.sender][levels[i]]) {
                revert EcoNovaCourseNFT__NFTAlreadyClaimed();
            }

            uint256 newTokenId = tokenCounter;
            _mint(msg.sender, newTokenId);
            _setTokenURI(newTokenId, levelTokenURIs[levels[i]]);

            hasClaimedNFT[msg.sender][levels[i]] = true;
            tokenMetadata[newTokenId] = metadata[i]; // Store additional metadata
            tokenIds[i] = newTokenId;
            tokenCounter++;
        }

        emit BatchNFTClaimed(msg.sender, levels, tokenIds);
    }
}

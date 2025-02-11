// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoNovaCourseNFT is ERC721URIStorage, Ownable {
    /**
     * variables
     */
    uint256 public tokenCounter;
    address public botAddress;

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
    event BotAddressUpdated(address oldBotAddress, address newBotAddress);

    /**
     * errors
     */
    error EcoNovaCourseNFT__NFTAlreadyClaimed();
    error EcoNovaCourseNFT__InvalidProof();
    error EcoNovaCourseNFT__InvalidSignerForProof();
    error EcoNovaManager__AddressCannotBeZero();
    error EcoNovaManager__MisMatchedArrayLength();

    constructor(
        address _botAddress,
        bytes32[3] memory roots,
        string[3] memory uris
    ) ERC721("EcoNovaCourseNFT", "ECNFT") Ownable(msg.sender) {
        botAddress = _botAddress;
        tokenCounter = 1;
        merkleRoots[Level.Beginner] = roots[0];
        merkleRoots[Level.Intermediate] = roots[1];
        merkleRoots[Level.Advanced] = roots[2];

        levelTokenURIs[Level.Beginner] = uris[0];
        levelTokenURIs[Level.Intermediate] = uris[1];
        levelTokenURIs[Level.Advanced] = uris[2];
    }

    /**
     * @dev Update the bot address (only callable by the bot)
     * @param _newBotAddress The new bot address
     */
    function updateBotAddress(address _newBotAddress) public onlyOwner {
        if (_newBotAddress == address(0)) {
            revert EcoNovaManager__AddressCannotBeZero();
        }
        address oldBotAddress = botAddress;
        botAddress = _newBotAddress;
        emit BotAddressUpdated(oldBotAddress, _newBotAddress);
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
        return keccak256(bytes.concat(_getMessageHash(user, level)));
    }

    /**
     * @notice Get the message hash for a user and level
     * @param user - the user to mark the completion for
     * @param level - the level of the course
     */
    function _getMessageHash(address user, Level level) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(user, level));
    }

    /**
     * @notice Update the Merkle root for a level
     * @param level - the level of the course
     * @param root - the new Merkle root
     * @param signature - the signature of the message hash
     */
    function updateRoot(Level level, bytes32 root, bytes memory signature) external {
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(
            _getMessageHash(msg.sender, level)
        );
        address signer = ECDSA.recover(ethSignedMessageHash, signature);

        if (signer != botAddress) {
            revert EcoNovaCourseNFT__InvalidSignerForProof();
        }
        merkleRoots[level] = root;
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
     * @notice Claim multiple NFTs for completing multiple courses in one transaction
     * @param levels - the levels of the courses
     * @param proofs - the Merkle proofs for each level
     * @param metadataList - additional metadata for each NFT
     */
    function batchClaimNFT(
        Level[] memory levels,
        bytes32[][] memory proofs,
        string[] memory metadataList
    ) external {
        if (levels.length != proofs.length || levels.length != metadataList.length) {
            revert EcoNovaManager__MisMatchedArrayLength();
        }

        uint256[] memory newTokenIds = new uint256[](levels.length);

        for (uint256 i = 0; i < levels.length; i++) {
            Level level = levels[i];

            if (hasClaimedNFT[msg.sender][level]) {
                revert EcoNovaCourseNFT__NFTAlreadyClaimed();
            }

            if (!_verifyProof(level, proofs[i])) {
                revert EcoNovaCourseNFT__InvalidProof();
            }

            uint256 newTokenId = tokenCounter;
            _mint(msg.sender, newTokenId);
            _setTokenURI(newTokenId, levelTokenURIs[level]);

            hasClaimedNFT[msg.sender][level] = true;
            tokenMetadata[newTokenId] = metadataList[i];
            newTokenIds[i] = newTokenId;

            tokenCounter++;
        }

        emit BatchNFTClaimed(msg.sender, levels, newTokenIds);
    }
}

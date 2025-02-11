// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract EcoNovaCourseNFT is ERC721URIStorage, Ownable {
    /**
     * variables
     */
    uint256 public tokenCounter;
    address public botAddress;
    uint256 public TIMESTAMP_EXPIRY = 120;

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
    mapping(Level => bytes32) public merkleRoots;
    mapping(bytes32 => bool) private usedSignatures;

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
    error EcoNovaCourseNFT__ExpiredSignature();
    error EcoNovaCourseNFT__SignatureAlreadyUsed();

    constructor(address _botAddress) ERC721("EcoNovaCourseNFT", "ECNFT") Ownable(msg.sender) {
        botAddress = _botAddress;
        tokenCounter = 1;
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
    function _verifyProof(
        address user,
        Level level,
        bytes32[] memory proof
    ) internal view returns (bool) {
        return MerkleProof.verify(proof, merkleRoots[level], _leaf(user, level));
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
     * @notice Get the message hash root for a user, level, and root
     * @param user - the user to mark the completion for
     * @param level - the level of the course
     * @param timestamp - the timestamp of the message
     * @param root - the Merkle root
     */

    function _getMessageHashRoot(
        address user,
        Level level,
        bytes32 root,
        uint256 timestamp
    ) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(user, level, root, block.chainid, timestamp));
    }

    /**
     * @notice Update the Merkle root for a level
     * @param level - the level of the course
     * @param root - the new Merkle root
     * @param timestamp - the timestamp of the message
     * @param signature - the signature of the message hash
     */
    function updateRoot(
        Level level,
        bytes32 root,
        uint256 timestamp,
        bytes memory signature
    ) external {
        if (block.timestamp > timestamp + TIMESTAMP_EXPIRY) {
            revert EcoNovaCourseNFT__ExpiredSignature();
        }

        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(
            _getMessageHashRoot(msg.sender, level, root, timestamp)
        );

        if (usedSignatures[ethSignedMessageHash]) {
            revert EcoNovaCourseNFT__SignatureAlreadyUsed();
        }

        address signer = ECDSA.recover(ethSignedMessageHash, signature);

        if (signer != botAddress) {
            revert EcoNovaCourseNFT__InvalidSignerForProof();
        }

        merkleRoots[level] = root;
        usedSignatures[ethSignedMessageHash] = true; // Mark this signature as used
    }

    /**
     * @notice Claim an NFT for completing a course
     * @param level - the level of the course
     * @param proof - the Merkle proof
     * @param tokenURI  - the token URI for the NFT
     */
    function claimNFT(Level level, bytes32[] memory proof, string memory tokenURI) external {
        if (hasClaimedNFT[msg.sender][level]) {
            revert EcoNovaCourseNFT__NFTAlreadyClaimed();
        }

        if (!_verifyProof(msg.sender, level, proof)) {
            revert EcoNovaCourseNFT__InvalidProof();
        }

        uint256 newTokenId = tokenCounter;
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        hasClaimedNFT[msg.sender][level] = true;
        tokenCounter++;

        emit NFTClaimed(msg.sender, level, newTokenId);
    }

    /**
     * @notice Claim multiple NFTs for completing multiple courses
     * @param levels - the levels of the course
     * @param proofs - the Merkle proofs
     * @param tokenURIs - the token URIs for the NFTs
     */
    function claimMultipleNFTs(
        Level[] memory levels,
        bytes32[][] memory proofs,
        string[] memory tokenURIs
    ) external {
        if (levels.length != proofs.length || levels.length != tokenURIs.length) {
            revert EcoNovaManager__MisMatchedArrayLength();
        }

        uint256[] memory newTokenIds = new uint256[](levels.length);
        for (uint256 i = 0; i < levels.length; i++) {
            if (hasClaimedNFT[msg.sender][levels[i]]) {
                revert EcoNovaCourseNFT__NFTAlreadyClaimed();
            }
            if (!_verifyProof(msg.sender, levels[i], proofs[i])) {
                revert EcoNovaCourseNFT__InvalidProof();
            }

            uint256 newTokenId = tokenCounter++;
            _mint(msg.sender, newTokenId);
            _setTokenURI(newTokenId, tokenURIs[i]);

            hasClaimedNFT[msg.sender][levels[i]] = true;
            newTokenIds[i] = newTokenId;
        }

        emit BatchNFTClaimed(msg.sender, levels, newTokenIds);
    }
}

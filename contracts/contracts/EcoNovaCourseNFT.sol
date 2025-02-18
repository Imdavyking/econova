// SPDX-License-Identifier: MIT
// This contract is designed to interact with deBridge on mainnets only.
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./debridge/interfaces/ICallProxy.sol";
import "./debridge/interfaces/IDeBridgeGateExtended.sol";
import "./debridge/library/Flags.sol";

contract EcoNovaCourseNFT is ERC721URIStorage, Ownable, AccessControl {
    /**
     * variables
     */
    uint256 public tokenCounter;
    address public botAddress;
    /// @dev Address of the cross-chain counter contract (on the `remoteChainID` chain)
    address remoteAddress;
    uint256 public TIMESTAMP_EXPIRY = 120;
    IDeBridgeGateExtended public deBridgeGate;

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
    mapping(address => mapping(Level => string)) public userTokenURIs;
    mapping(uint256 => ChainInfo) supportedChains;

    /**
     * events
     */
    event NFTClaimed(address indexed user, Level level, uint256 tokenId);
    event BatchNFTClaimed(address indexed user, Level[] levels, uint256[] tokenIds);
    event BotAddressUpdated(address oldBotAddress, address newBotAddress);
    event RootUpdated(Level level, bytes32 root);
    event NFTReceived(uint256 tokenId, address recipient, string tokenURI);
    event NFTBridged(uint256 tokenId, address recipient, uint256 targetChainId);
    event SupportedChainAdded(uint256 chainId, bytes crossChainIncrementorAddress);
    event SupportedChainRemoved(uint256 chainId);

    /**
     * errors
     */
    error EcoNovaCourseNFT__NFTAlreadyClaimed();
    error EcoNovaCourseNFT__InvalidProof();
    error EcoNovaCourseNFT__InvalidSignerForProof();
    error EcoNovaCourseNFT__AddressCannotBeZero();
    error EcoNovaCourseNFT__MisMatchedArrayLength();
    error EcoNovaCourseNFT__ExpiredSignature();
    error EcoNovaCourseNFT__SignatureAlreadyUsed();
    error EcoNovaCourseNFT__AdminBadRole();
    error EcoNovaCourseNFT__FeeNotCoveredByMsgValue();
    error EcoNovaCourseNFT__CallProxyBadRole();
    error EcoNovaCourseNFT__NativeSenderBadRole(bytes nativeSender, uint256 chainIdFrom);
    error EcoNovaCourseNFT__ChainNotSupported(uint256 chainId);
    error EcoNovaCourseNFT__CrossChainTransferToSameChain();

    /** modifiers */
    modifier onlyAdmin() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert EcoNovaCourseNFT__AdminBadRole();
        _;
    }

    modifier onlyValidCrossChainSender() {
        ICallProxy callProxy = ICallProxy(deBridgeGate.callProxy());

        if (address(callProxy) != msg.sender) {
            revert EcoNovaCourseNFT__CallProxyBadRole();
        }

        uint256 chainIdFrom = callProxy.submissionChainIdFrom();

        if (!supportedChains[chainIdFrom].isSupported) {
            revert EcoNovaCourseNFT__ChainNotSupported(chainIdFrom);
        }

        bytes memory nativeSender = callProxy.submissionNativeSender();
        address senderAddress = bytesToAddress(nativeSender);

        if (keccak256(supportedChains[chainIdFrom].callerAddress) != keccak256(nativeSender)) {
            revert EcoNovaCourseNFT__NativeSenderBadRole(nativeSender, chainIdFrom);
        }

        _;
    }

    /** structs */
    struct ChainInfo {
        bool isSupported;
        bytes callerAddress;
    }

    constructor(address _botAddress) ERC721("EcoNovaCourseNFT", "ECNFT") Ownable(msg.sender) {
        botAddress = _botAddress;
        tokenCounter = 1;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Check if the contract supports an interface
     * @param interfaceId - the interface ID
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice Get the address from bytes
     * @param bys - the bytes to convert to an address
     */

    function bytesToAddress(bytes memory bys) private pure returns (address addr) {
        assembly {
            addr := mload(add(bys, 20))
        }
    }

    /**
     * @notice Set the deBridgeGate contract address
     * @param deBridgeGate_ - the deBridgeGate contract address
     */

    function setDeBridgeGate(IDeBridgeGateExtended deBridgeGate_) external onlyAdmin {
        deBridgeGate = deBridgeGate_;
    }

    /**
     * @notice Add support for a chain
     * @param _chainId - the chain ID
     * @param _crossChainAddress - the cross chain address
     */

    function addChainSupport(
        uint256 _chainId,
        bytes memory _crossChainAddress
    ) external onlyAdmin {
        supportedChains[_chainId].callerAddress = _crossChainAddress;
        supportedChains[_chainId].isSupported = true;

        emit SupportedChainAdded(_chainId, _crossChainAddress);
    }

    /**
     * @notice Remove support for a chain
     * @param _chainId - the chain ID
     */
    function removeChainSupport(uint256 _chainId) external onlyAdmin {
        supportedChains[_chainId].isSupported = false;
        supportedChains[_chainId].callerAddress = "";
        emit SupportedChainRemoved(_chainId);
    }

    /**
     * @notice Set the cross chain contract address
     * @param _remoteAddress - the cross chain address
     */
    function setCrossChainContractAddress(address _remoteAddress) external onlyAdmin {
        remoteAddress = _remoteAddress;
    }

    /**
     * @notice Mint an NFT
     * @param recipient - the recipient of the NFT
     * @param tokenId - the token ID
     */

    function sendCrossChainNFT(
        uint256 dstChain_,
        address recipient,
        uint256 tokenId
    ) external payable {
        if (block.chainid == dstChain_) {
            revert EcoNovaCourseNFT__CrossChainTransferToSameChain();
        }
        string memory tokenURI_ = tokenURI(tokenId);
        _burn(tokenId);
        bytes memory dstTxCall = abi.encodeCall(this.receiveNFT, (recipient, tokenId, tokenURI_));
        _send(dstChain_, dstTxCall, 0);
    }

    /**
     * @notice Receive an NFT
     * @param recipient - the recipient of the NFT
     * @param tokenId - the token ID
     * @param _tokenURI - the token URI
     */
    function receiveNFT(
        address recipient,
        uint256 tokenId,
        string memory _tokenURI
    ) external onlyValidCrossChainSender {
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        emit NFTReceived(tokenId, recipient, _tokenURI);
    }

    /**
     * @notice Send a transaction to the deBridgeGate
     * @param _dstTransactionCall - the destination transaction call
     * @param _executionFee - the execution fee
     */
    function _send(
        uint256 dstChain_,
        bytes memory _dstTransactionCall,
        uint256 _executionFee
    ) internal {
        uint256 protocolFee = deBridgeGate.globalFixedNativeFee();
        if (msg.value < (protocolFee + _executionFee)) {
            revert EcoNovaCourseNFT__FeeNotCoveredByMsgValue();
        }

        uint assetFeeBps = deBridgeGate.globalTransferFeeBps();
        uint amountToBridge = _executionFee;
        uint amountAfterBridge = (amountToBridge * (10000 - assetFeeBps)) / 10000;

        IDeBridgeGate.SubmissionAutoParamsTo memory autoParams;
        autoParams.executionFee = amountAfterBridge;
        autoParams.flags = Flags.setFlag(autoParams.flags, Flags.PROXY_WITH_SENDER, true);
        autoParams.flags = Flags.setFlag(autoParams.flags, Flags.REVERT_IF_EXTERNAL_FAIL, true);
        autoParams.data = _dstTransactionCall;
        autoParams.fallbackAddress = abi.encodePacked(msg.sender);

        try
            deBridgeGate.send{value: msg.value}(
                address(0),
                amountToBridge,
                dstChain_,
                abi.encodePacked(remoteAddress),
                "",
                true,
                0,
                abi.encode(autoParams)
            )
        {} catch Error(string memory err) {
            revert(err);
        }
    }

    /**
     * @dev Update the bot address (only callable by the bot)
     * @param _newBotAddress The new bot address
     */
    function updateBotAddress(address _newBotAddress) external onlyOwner {
        if (_newBotAddress == address(0)) {
            revert EcoNovaCourseNFT__AddressCannotBeZero();
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
        return keccak256(bytes.concat(keccak256(abi.encode(user, level))));
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
        usedSignatures[ethSignedMessageHash] = true;

        emit RootUpdated(level, root);
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
        userTokenURIs[msg.sender][level] = tokenURI;
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
            revert EcoNovaCourseNFT__MisMatchedArrayLength();
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

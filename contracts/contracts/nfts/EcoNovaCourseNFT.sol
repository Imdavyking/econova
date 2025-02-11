// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoNovaCourseNFT is ERC721URIStorage {
    uint256 public tokenCounter;

    enum Level {
        Beginner,
        Intermediate,
        Advanced
    }

    mapping(address => mapping(Level => bool)) public hasCompletedLevel;
    mapping(address => mapping(Level => bool)) public hasClaimedNFT;

    event NFTClaimed(address indexed user, Level level, uint256 tokenId);

    error EcoNovaCourseNFT__LevelAlreadyCompleted();
    error EcoNovaCourseNFT__NFTAlreadyClaimed();
    error EcoNovaCourseNFT__LevelNotCompleted();

    constructor() ERC721("EcoNovaCourseNFT", "CCNFT") {
        tokenCounter = 1;
    }

    function markCourseCompletion(address user, Level level) external {
        if (hasCompletedLevel[user][level]) {
            revert EcoNovaCourseNFT__LevelAlreadyCompleted();
        }
        hasCompletedLevel[user][level] = true;
    }

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

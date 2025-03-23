// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract EcoNovaCarbonCreditsV2 is ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    struct CarbonCredit {
        uint256 amount;
        string project;
        bool retired;
        bool revoked;
    }

    uint256 private _tokenIdCounter;
    mapping(uint256 => CarbonCredit) public carbonCredits;

    /** Events */
    event CreditIssued(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 amount,
        string project
    );
    event CreditRetired(uint256 indexed tokenId, address indexed owner);
    event CreditRevoked(uint256 indexed tokenId, address indexed owner);
    event CreditUpdated(uint256 indexed tokenId, uint256 newAmount, string newProject);

    /** Errors */
    error EcoNovaCarbonCreditsV2__AmountMustBeGreaterThanZero();
    error EcoNovaCarbonCreditsV2__CreditAlreadyRetired();
    error EcoNovaCarbonCreditsV2__CreditAlreadyRevoked();
    error EcoNovaCarbonCreditsV2__NotTheOwnerOfThisCredit();
    error EcoNovaCarbonCreditsV2__NotAuthorized();

    function issueCredit(
        address recipient,
        uint256 amount,
        string memory project
    ) public onlyOwner {
        if (amount <= 0) {
            revert EcoNovaCarbonCreditsV2__AmountMustBeGreaterThanZero();
        }

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        carbonCredits[newTokenId] = CarbonCredit(amount, project, false, false);
        _safeMint(recipient, newTokenId);

        emit CreditIssued(newTokenId, recipient, amount, project);
    }

    function batchIssueCredits(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string[] calldata projects
    ) external onlyOwner {
        if (recipients.length == 0) {
            revert EcoNovaCarbonCreditsV2__AmountMustBeGreaterThanZero();
        }

        if (recipients.length != amounts.length || amounts.length != projects.length) {
            revert EcoNovaCarbonCreditsV2__NotAuthorized();
        }

        for (uint256 i = 0; i < recipients.length; i++) {
            issueCredit(recipients[i], amounts[i], projects[i]);
        }
    }

    function retireCredit(uint256 tokenId) external {
        if (ownerOf(tokenId) != msg.sender) {
            revert EcoNovaCarbonCreditsV2__NotTheOwnerOfThisCredit();
        }

        if (carbonCredits[tokenId].retired) {
            revert EcoNovaCarbonCreditsV2__CreditAlreadyRetired();
        }

        carbonCredits[tokenId].retired = true;
        emit CreditRetired(tokenId, msg.sender);
    }

    function revokeCredit(uint256 tokenId) external onlyOwner {
        if (carbonCredits[tokenId].revoked) {
            revert EcoNovaCarbonCreditsV2__CreditAlreadyRevoked();
        }

        carbonCredits[tokenId].revoked = true;
        emit CreditRevoked(tokenId, ownerOf(tokenId));
    }

    function updateCredit(
        uint256 tokenId,
        uint256 newAmount,
        string memory newProject
    ) external onlyOwner {
        if (carbonCredits[tokenId].retired || carbonCredits[tokenId].revoked) {
            revert EcoNovaCarbonCreditsV2__NotAuthorized();
        }

        carbonCredits[tokenId].amount = newAmount;
        carbonCredits[tokenId].project = newProject;
        emit CreditUpdated(tokenId, newAmount, newProject);
    }

    function getCreditDetails(uint256 tokenId) external view returns (CarbonCredit memory) {
        return carbonCredits[tokenId];
    }

    function version() public pure returns (string memory) {
        return "V2";
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}

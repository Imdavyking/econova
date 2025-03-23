// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract EcoNovaCarbonCreditsV1 is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    struct CarbonCredit {
        uint256 amount;
        string project;
        bool retired;
    }

    uint256 private _tokenIdCounter;
    mapping(uint256 => CarbonCredit) public carbonCredits;

    /** events */
    event CreditIssued(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 amount,
        string project
    );
    event CreditRetired(uint256 indexed tokenId, address indexed owner);

    /** errors */
    error EcoNovaCarbonCreditsV1__AmountMustBeGreaterThanZero();
    error EcoNovaCarbonCreditsV1__CreditAlreadyRetired();
    error EcoNovaCarbonCreditsV1__NotTheOwnerOfThisCredit();

    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("EcoNovaCarbonCredit", "ECN");
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    function issueCredit(
        address recipient,
        uint256 amount,
        string memory project
    ) external onlyOwner {
        if (amount <= 0) {
            revert EcoNovaCarbonCreditsV1__AmountMustBeGreaterThanZero();
        }

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        carbonCredits[newTokenId] = CarbonCredit(amount, project, false);
        _safeMint(recipient, newTokenId);

        emit CreditIssued(newTokenId, recipient, amount, project);
    }

    function retireCredit(uint256 tokenId) external {
        if (ownerOf(tokenId) != msg.sender) {
            revert EcoNovaCarbonCreditsV1__NotTheOwnerOfThisCredit();
        }

        if (carbonCredits[tokenId].retired) {
            revert EcoNovaCarbonCreditsV1__CreditAlreadyRetired();
        }

        carbonCredits[tokenId].retired = true;
        emit CreditRetired(tokenId, msg.sender);
    }

    function getCreditDetails(uint256 tokenId) external view returns (CarbonCredit memory) {
        return carbonCredits[tokenId];
    }

    function version() public pure returns (string memory) {
        return "V1";
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}

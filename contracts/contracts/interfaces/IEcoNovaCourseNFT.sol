// SPDX-License-Identifier: MIT
// This contract is designed to interact with deBridge on mainnets only.
pragma solidity ^0.8.7;

interface IEcoNovaCourseNFT {
    function receiveNFT(address recipient, uint256 tokenId, string memory _tokenURI) external;
}

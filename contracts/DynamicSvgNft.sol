// DynamicSvgNft.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DynamicSvgNft is ERC721 {
    // mint
    // store our SVG information somewhere
    // Some logic to say "Show X image" or "Show Y image"

    uint256 private s_tokenCounter;

    constructor(
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
    }

    function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
    }
}

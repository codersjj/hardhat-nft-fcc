// DynamicSvgNft.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {
    // mint
    // store our SVG information somewhere
    // Some logic to say "Show X image" or "Show Y image"

    uint256 private s_tokenCounter;
    string private i_lowImageURI;
    string private i_highImageURI;
    string private constant BASE64_ENCODED_SVG_PREFIX =
        "data:image/svg+xml;base64,";

    constructor(
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
    }

    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return
            string(
                abi.encodePacked(BASE64_ENCODED_SVG_PREFIX, svgBase64Encoded)
            );
    }

    function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
    }
}

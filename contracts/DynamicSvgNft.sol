// DynamicSvgNft.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

error ERC721Metadata__URI_QueryFor_NonExistentToken();

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
        // example:
        // '<svg width="500" height="500" viewBox="0 0 285 350" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="black" d="M150,0,L75,200,L225,200,Z"></path></svg>'
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

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }

        string memory imageURI = "hi!";

        // https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data
        // image URI: data:image/svg+xml;base64,<data>
        // JSON URI: data:application/json;base64,<data>

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on the Chainlink Feed", "attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}

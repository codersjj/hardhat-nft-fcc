// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RandomIpfsNft is VRFConsumerBaseV2Plus, ERC721 {
    // when we mint an NFT, we will trigger a Chainlink VRF call to get us a random number
    // using that number, we will get a random NFT
    // Pug, Shiba Inu, St. Bernard
    // Pug super rare
    // Shiba Inu kind of rare
    // St. Bernard common
    // users have to pay to mint an NFT
    // the owner of the contract can withdraw the ETH

    // Chainlink VRF Variables
    uint256 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    bool private s_enableNativePayment;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF Helpers
    mapping(uint256 => address) public s_requestIdToSender;

    // NFT Variables
    uint256 public s_tokenCounter;

    constructor(
        address vrfCoordinator,
        uint256 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        bool enableNativePayment
    ) VRFConsumerBaseV2Plus(vrfCoordinator) ERC721("Random IPFS NFT", "RIN") {
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_enableNativePayment = enableNativePayment;
    }

    function requestNft() public returns (uint256 requestId) {
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_gasLane,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: s_enableNativePayment
                    })
                )
            })
        );

        s_requestIdToSender[requestId] = msg.sender;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        address dogOwner = s_requestIdToSender[requestId];
        _safeMint(dogOwner, s_tokenCounter);
    }

    function tokenURI(uint256) public view override returns (string memory) {}

    function setEnableNativePayment(bool enableNativePayment) external {
        s_enableNativePayment = enableNativePayment;
    }

    function getEnableNativePayment() public view returns (bool) {
        return s_enableNativePayment;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {ERC721, ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransferFailed();

contract RandomIpfsNft is VRFConsumerBaseV2Plus, ERC721URIStorage {
    // when we mint an NFT, we will trigger a Chainlink VRF call to get us a random number
    // using that number, we will get a random NFT
    // Pug, Shiba Inu, St. Bernard
    // Pug super rare
    // Shiba Inu kind of rare
    // St. Bernard common

    // users have to pay to mint an NFT
    // the owner of the contract can withdraw the ETH

    // Type Declaration
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

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
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenURIs;
    uint256 internal immutable i_mintFee;

    // Events
    event NFTRequested(uint256 indexed requestId, address requester);
    event NFTMinted(Breed dogBreed, address minter);

    constructor(
        address vrfCoordinator,
        uint256 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        bool enableNativePayment,
        string[3] memory dogTokenURIs,
        uint256 mintFee
    ) VRFConsumerBaseV2Plus(vrfCoordinator) ERC721("Random IPFS NFT", "RIN") {
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_enableNativePayment = enableNativePayment;
        s_dogTokenURIs = dogTokenURIs;
        i_mintFee = mintFee;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__NeedMoreETHSent();
        }

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

        emit NFTRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        console.log("Gas at start", gasleft());
        uint256 newItemId = s_tokenCounter;
        s_tokenCounter++;
        console.log("Gas after incrementing token counter", gasleft());
        address dogOwner = s_requestIdToSender[requestId];

        // What does this token look like?
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        // 0-99
        // 7 -> PUG
        // 12 -> Shiba Inu
        // 88 -> St. Bernard
        // 45 -> St. Bernard

        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        _safeMint(dogOwner, newItemId);
        console.log("Gas after minting NFT", gasleft());
        _setTokenURI(newItemId, s_dogTokenURIs[uint256(dogBreed)]);

        emit NFTMinted(dogBreed, dogOwner);
    }

    function getBreedFromModdedRng(
        uint256 moddedRng
    ) public pure returns (Breed) {
        uint256[3] memory chanceArray = getChanceArray();
        uint256 cumulativeSum = 0;
        // for example: moddedRng = 25
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (
                moddedRng >= cumulativeSum &&
                moddedRng < cumulativeSum + chanceArray[i]
            ) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }

        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function setEnableNativePayment(bool enableNativePayment) external {
        s_enableNativePayment = enableNativePayment;
    }

    function getEnableNativePayment() public view returns (bool) {
        return s_enableNativePayment;
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenURI(uint256 index) public view returns (string memory) {
        return s_dogTokenURIs[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}

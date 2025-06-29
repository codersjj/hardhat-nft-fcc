const path = require("path")
const { network } = require("hardhat")
const { vars } = require("hardhat/config")
const BasicNFTModule = require("../ignition/modules/BasicNFT")
const RandomIpfsNftModule = require("../ignition/modules/RandomIpfsNft")
const DynamicSvgNftModule = require("../ignition/modules/DynamicSvgNft")
const {
  handleTokenURIs,
  updateTokenURIsInParametersJson,
} = require("../utils/handleRandomIpfsNft")
const { getImageFileCount } = require("../utils/uploadToPinata")
const getSvgs = require("../utils/getSvgs")
const { IMAGES_DIR_PATH } = require("../constants")
const { developmentChains } = require("../helper-hardhat-config")

async function main() {
  // BasicNFT
  const { basicNFT } = await hre.ignition.deploy(BasicNFTModule)
  const basicNFTMintTx = await basicNFT.mintNFT()
  await basicNFTMintTx.wait(1)
  console.log(`Basic NFT index 0 has tokenURI: ${await basicNFT.tokenURI(0)}`)

  // RandomIpfsNft
  const fileCount = getImageFileCount(IMAGES_DIR_PATH)
  let tokenURIs = Array(fileCount).fill("")
  const UPLOAD_TO_PINATA = vars.get("UPLOAD_TO_PINATA")
  if (UPLOAD_TO_PINATA === "true") {
    tokenURIs = await handleTokenURIs()
  }
  updateTokenURIsInParametersJson(tokenURIs)

  const { randomIpfsNft, vrfCoordinator } = await hre.ignition.deploy(
    RandomIpfsNftModule,
    {
      parameters: path.resolve(__dirname, "../ignition/parameters.json"),
    }
  )
  const mintFee = await randomIpfsNft.getMintFee()

  await new Promise(async (resolve, reject) => {
    // setTimeout(resolve, 120000) // 2 minutes

    randomIpfsNft.once("NFTMinted", async () => {
      resolve()
    })
    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
      value: mintFee,
    })
    const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
    if (developmentChains.includes(network.name)) {
      await vrfCoordinator.fulfillRandomWords(
        randomIpfsNftMintTxReceipt.logs[1].topics[1],
        randomIpfsNft.target
      )
    }
  })

  console.log(
    `Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`
  )

  // DynamicSvgNft
  const { lowSvg, highSvg } = getSvgs()
  const { dynamicSvgNft } = await hre.ignition.deploy(DynamicSvgNftModule, {
    parameters: {
      DynamicSvgNft: {
        lowSvg,
        highSvg,
      },
    },
  })
  const highValue = 1000_00000000
  const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
  await dynamicSvgNftMintTx.wait(1)
  console.log(
    `Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`
  )
}

main().catch(console.error)

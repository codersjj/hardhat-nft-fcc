const path = require("path")
const { vars } = require("hardhat/config")
const RandomIpfsNftModule = require("../ignition/modules/RandomIpfsNft")
const { getImageFileCount } = require("../utils/uploadToPinata")
const { IMAGES_DIR_PATH } = require("../constants")
const {
  handleTokenURIs,
  updateTokenURIsInParametersJson,
} = require("../utils/handleRandomIpfsNft")

// get the IPFS hashes of our images
// 1. With our own IPFS node. https://docs.ipfs.tech/
// 2. Pinata https://pinata.cloud/
// 3. nft.storage https://nft.storage/

async function main() {
  const fileCount = getImageFileCount(IMAGES_DIR_PATH)
  let tokenURIs = Array(fileCount).fill("")
  // after we handleTokenURIs successfully, we can set UPLOAD_TO_PINATA to false
  // to skip uploading to Pinata in the future
  // this is useful for development, so we don't have to upload the same images and metadata
  // every time we deploy the contract
  // we can just use the existing tokenURIs in the parameters.json file
  const UPLOAD_TO_PINATA = vars.get("UPLOAD_TO_PINATA")
  if (UPLOAD_TO_PINATA === "true") {
    tokenURIs = await handleTokenURIs()
  }
  console.log("🚀 ~ main ~ tokenURIs:", tokenURIs)
  updateTokenURIsInParametersJson(tokenURIs)

  const { randomIpfsNft } = await hre.ignition.deploy(RandomIpfsNftModule, {
    // parameters: {
    //   RandomIpfsNft: {
    //     dogTokenURIs: tokenURIs,
    //   },
    // },
    parameters: path.resolve(__dirname, "../ignition/parameters.json"),
  })
  console.log(`RandomIpfsNft deployed to: ${await randomIpfsNft.getAddress()}`)
}

main().catch(console.error)

module.exports = {
  handleTokenURIs,
}

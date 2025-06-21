const path = require("path")
const fs = require("fs")
const { vars } = require("hardhat/config")
const RandomIpfsNftModule = require("../ignition/modules/RandomIpfsNft")
const {
  storeImages,
  storeMetadata,
  getImageFileCount,
} = require("../utils/uploadToPinata")
const { IMAGES_DIR_PATH } = require("../constants")

// get the IPFS hashes of our images
// 1. With our own IPFS node. https://docs.ipfs.tech/
// 2. Pinata https://pinata.cloud/
// 3. nft.storage https://nft.storage/

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
}

async function handleTokenURIs() {
  let tokenURIs = []

  // store the image in IPFS
  const { res: uploads } = await storeImages(IMAGES_DIR_PATH)
  // store the metadata in IPFS
  const res = await storeMetadata(metadataTemplate, uploads)

  res.forEach((upload) => {
    tokenURIs.push(`ipfs://${upload.cid}`)
  })

  console.log("🚀 ~ handleTokenURIs ~ tokenURIs:", tokenURIs)

  return tokenURIs
}

function updateTokenURIsInParametersJson(tokenURIs) {
  const parametersPath = path.join(__dirname, "../ignition/parameters.json")
  const parameters = JSON.parse(fs.readFileSync(parametersPath, "utf8"))
  parameters.RandomIpfsNft = parameters.RandomIpfsNft || {}
  parameters.RandomIpfsNft.dogTokenURIs = tokenURIs
  fs.writeFileSync(parametersPath, JSON.stringify(parameters, null, 2))
  console.log("Updated parameters.json with tokenURIs.")
}

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

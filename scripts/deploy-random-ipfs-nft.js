const { vars } = require("hardhat/config")
const RandomIpfsNftModule = require("../ignition/modules/RandomIpfsNft")
const { storeImages } = require("../utils/uploadToPinata")

// get the IPFS hashes of our images
// 1. With our own IPFS node. https://docs.ipfs.tech/
// 2. Pinata https://pinata.cloud/
// 3. nft.storage https://nft.storage/

const imagesDirPath = "./images/randomNft"

async function handleTokenURIs() {
  let tokenURIs = []

  // store the image in IPFS
  await storeImages(imagesDirPath)
  // store the metadata in IPFS

  return tokenURIs
}

async function getDogTokenURIs() {
  return ["1", "2", "3"]
}

async function main() {
  let tokenURIs = null
  const UPLOAD_TO_PINATA = vars.get("UPLOAD_TO_PINATA")
  if (UPLOAD_TO_PINATA === "true") {
    tokenURIs = await handleTokenURIs()
  }

  const { randomIpfsNft } = await hre.ignition.deploy(RandomIpfsNftModule, {
    parameters: {
      RandomIpfsNft: {
        dogTokenURIs: tokenURIs,
      },
    },
  })
  console.log(`RandomIpfsNft deployed to: ${await randomIpfsNft.getAddress()}`)
}

main().catch(console.error)

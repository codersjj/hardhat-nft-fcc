const { vars } = require("hardhat/config")
const RandomIpfsNftModule = require("../ignition/modules/RandomIpfsNft")
const { storeImages, storeMetadata } = require("../utils/uploadToPinata")

// get the IPFS hashes of our images
// 1. With our own IPFS node. https://docs.ipfs.tech/
// 2. Pinata https://pinata.cloud/
// 3. nft.storage https://nft.storage/

const imagesDirPath = "./images/randomNft"
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
  const { res: uploads } = await storeImages(imagesDirPath)
  // store the metadata in IPFS
  const res = await storeMetadata(metadataTemplate, uploads)

  res.forEach((upload) => {
    tokenURIs.push(`ipfs://${upload.cid}`)
  })

  console.log("🚀 ~ handleTokenURIs ~ tokenURIs:", tokenURIs)

  return tokenURIs
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

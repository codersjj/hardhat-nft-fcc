const path = require("path")
const fs = require("fs")
const { Blob } = require("buffer")
const { PinataSDK } = require("pinata")
const { vars } = require("hardhat/config")

const pinata = new PinataSDK({
  pinataJwt: vars.get("PINATA_JWT"),
  pinataGateway: vars.get("PINATA_GATEWAY"),
})

async function storeImages(imagesDirPath) {
  const absoluteImagesDirPath = path.resolve(imagesDirPath)
  const files = fs.readdirSync(absoluteImagesDirPath)
  console.log("files", files)

  let res = []
  console.log("Uploading images to Pinata...")
  for (const file of files) {
    console.log(`Working on file: ${file} ...`)
    const filePath = path.join(absoluteImagesDirPath, file)
    // const readStream = fs.createReadStream(filePath)
    const blob = new Blob([fs.readFileSync(filePath)])
    const _file = new File([blob], file)
    try {
      const upload = await pinata.upload.public.file(_file)
      console.log("🚀 ~ storeImages ~ upload:", upload)
      res.push(upload)
    } catch (error) {
      console.log(error)
    }
  }

  return { res, files }
}

async function storeMetadata(metadataTemplate, uploads) {
  console.log("Uploading metadata to Pinata...")
  let res = []

  for (const upload of uploads) {
    const tokenURIMetadata = { ...metadataTemplate }
    tokenURIMetadata.name = upload.name.replace(/\.png$/, "")
    tokenURIMetadata.description = `An adorable ${tokenURIMetadata.name} pup!`
    tokenURIMetadata.image = `ipfs://${upload.cid}`
    console.log(`Uploading tokenURIMetadata for ${tokenURIMetadata.name}...`)
    // store the JSON in Pinata / IPFS
    try {
      const uploadRes = await pinata.upload.public
        .json(tokenURIMetadata)
        .name(`${tokenURIMetadata.name}.json`)
      console.log(
        `Uploaded tokenURIMetadata for ${tokenURIMetadata.name} successfully!`
      )
      res.push(uploadRes)
    } catch (error) {
      console.error(
        `Error uploading metadata for ${tokenURIMetadata.name}:`,
        error
      )
    }
  }

  return res
}

module.exports = {
  storeImages,
  storeMetadata,
}

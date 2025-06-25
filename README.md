# hardhat-nft-fcc

3 contracts

1. Basic NFT
2. Random IPFS NFT
    - Pros: Cheap
    - Cons: Someone need to pin our data
3. Dynamic SVG NFT
    - Pros: The data is on chain!
    - Cons: much more expensive!

If price of ETH is above X -> Happy face
if it's is below -> Frowny face

## Deploy

```bash
# hardhat
hh run scripts/deploy-random-ipfs-nft.js --network hardhat

# sepolia
hh run scripts/deploy-random-ipfs-nft.js --network sepolia
```

## Ignition wipe

see: https://hardhat.org/ignition/docs/guides/error-handling#wiping-a-previous-execution

example:

```bash
hh ignition wipe chain-11155111 RandomIpfsNft#RandomIpfsNft
```

## Verify

see: https://hardhat.org/ignition/docs/guides/verify#deploying-and-verifying-on-the-sepolia-testnet

example:

```bash
hh ignition verify chain-11155111
```

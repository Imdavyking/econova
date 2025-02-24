# Contracts

EcoNova is a decentralized platform, designed to offer users the ability to interact with smart contracts and decentralized applications, while also providing various incentives for participating in its ecosystem.

## Requirements

-   [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
    -   You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`.
-   [Node.js](https://nodejs.org/en/)
    -   You'll know you've installed Node.js right if you can run:
        -   `node --version` and get an output like `vx.x.x`.
-   [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) instead of `npm`
    -   You'll know you've installed Yarn right if you can run:
        -   `yarn --version` and get an output like `x.x.x`.
        -   You might need to install it with `npm`.

## Quickstart

```bash
git clone https://github.com/Imdavyking/econova/
cd econova/contracts
yarn
```

## Environment Variables

Create a `.env` file in the project root and add the following variables:

```bash
 # 🚨 SECURITY NOTICE: Never commit this file to Git! 🚨
# Always use environment variables securely in production.

# Private key (⚠️ DO NOT use in production! Remove before deploying.)
PRIVATE_KEY=

# Path to the encrypted keystore file (absolute or relative to the project root).
KEYSTORE_FILE=./keystore.json

# Keystore decryption password (⚠️ Do NOT store directly in this file! Use export instead.)
# Run this command in your terminal instead of storing it here:
# export KEYSTORE_PASSWORD="your-secure-password"
KEYSTORE_PASSWORD=
RPC_URL=
ORACLE_ADDRESS=
NODE_ENV=
CHAIN_ID=
API_URL=
BROWSER_URL=
CHAIN_NAME=
CHAIN_CURRENCY_NAME=
CHAIN_SYMBOL=
CHAIN_BLOCKEXPLORER_URL=
API_SCAN_VERIFIER_KEY=
CROSS_CHAIN_ID=
CROSS_CHAIN_ID_API_SCAN_VERIFIER_KEY=
```

## Usage

### Deploy:

```bash
yarn deploy
```

### Testing

```bash
yarn test
```

## Deployment to Testnet

### 1. Setup Environment Variables

You'll want to set your `RPC_URL` and `PRIVATE_KEY` as environment variables. You can add them to a `.env` file, similar to what you see in `.env.example`.

-   `PRIVATE_KEY`: The private key of your account (like from [MetaMask](https://metamask.io/)). **NOTE:** FOR DEVELOPMENT, PLEASE USE A KEY THAT DOESN'T HAVE ANY REAL FUNDS ASSOCIATED WITH IT.
    -   You can [learn how to export it here](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key).
-   `RPC_URL`: This is the URL of the ETH testnet node you're working with.

### 2. Get Testnet ETH

Head over to faucet and get some testnet **ETH** tokens. You should see the **ETH** tokens show up in your MetaMask.

### 3. Deploy

```bash
yarn deploy
```

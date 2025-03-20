# Frontend

## Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [Nodejs](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run:
    - `node --version` and get an ouput like: `vx.x.x`
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) instead of `npm`
  - You'll know you've installed yarn right if you can run:
    - `yarn --version` and get an output like: `x.x.x`
    - You might need to install it with `npm`

## Quickstart

```
git clone https://github.com/Imdavyking/econova/
cd econova/frontend
yarn
```

## Environment Variables

Create a `.env` file in the project root and add the following variables:

```bash
  VITE_SERVER_URL=
  VITE_CONTRACT_ADDRESS=
  VITE_CHAIN_ID=
  VITE_CHAIN_NAME=
  VITE_CHAIN_CURRENCY_NAME=
  VITE_CHAIN_SYMBOL=
  VITE_RPC_URL=
  VITE_CHAIN_BLOCKEXPLORER_URL=
  VITE_APP_NAME=
  VITE_GRAPH_QL_ENDPOINT=
  VITE_WALLET_CONNECT_PROJECT_ID=
  VITE_TWITTER_NAME=
  VITE_NFT_COURSE_CONTRACT_ADDRESS=
  VITE_CROSS_CHAIN_TOKEN_ADDRESS=
  VITE_CROSS_CHAIN_RPC_URL=
  VITE_CROSS_CHAIN_ID=
  VITE_CROSS_CHAIN_ENDPOINT_V2_ID=
  VITE_CROSS_CHAIN_ENDPOINT_V2_ADDRESS=
  VITE_ECONOVA_GOVERNOR_CONTRACT_ADDRESS=
```

# Usage

Run:

```
yarn dev
```

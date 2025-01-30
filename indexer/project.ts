import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

import * as dotenv from "dotenv";
import path from "path";

const mode = process.env.NODE_ENV || "production";

// Load the appropriate .env file
const dotenvPath = path.resolve(
  __dirname,
  `.env${mode !== "production" ? `.${mode}` : ""}`
);
dotenv.config({ path: dotenvPath });

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "creator-testnet-starter",
  description:
    "This project can be use as a starting point for developing your new Creator Testnet SubQuery project",
  runner: {
    node: {
      name: "@subql/node-ethereum",
      version: ">=3.0.0",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    /**
     * chainId is the EVM Chain ID, for Creator Testnet this is 66665
     * https://chainlist.org/chain/66665
     */
    chainId: process.env.CHAIN_ID!,
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: process.env.ENDPOINT!?.split(",") as string[] | string,
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 6746942,
      options: {
        abi: "Abi",
        address: "0x6Ae82716EF15A0979548A0A8620639920d28369F",
      },
      assets: new Map([["Abi", { file: "./abis/abi.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            handler: "handleWithdrawDonationAbiTx",
            kind: EthereumHandlerKind.Call,
            filter: {
              function: "withdrawDonation(address,uint256)",
            },
          },
          {
            handler: "handleDonatedAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["Donated(address,address,uint256)"],
            },
          },
          {
            handler: "handleOwnershipTransferredAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["OwnershipTransferred(address,address)"],
            },
          },
          {
            handler: "handlePointsAddedAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["PointsAdded(address,uint256)"],
            },
          },
          {
            handler: "handlePointsRedeemedAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["PointsRedeemed(address,uint256)"],
            },
          },
          {
            handler: "handleSetOrocleAbiLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["SetOrocle(address,address)"],
            },
          },
        ],
      },
    },
  ],
  repository: "https://github.com/subquery/ethereum-subql-starter",
};

// Must set default to the project instance
export default project;

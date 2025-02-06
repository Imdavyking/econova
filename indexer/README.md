# Indexer

**EcoNova** is a decentralized platform, enabling seamless interaction with smart contracts and decentralized applications (dApps). This SubQuery project indexes key on-chain data, focusing on **user interactions, incentive distributions, and transaction tracking**. By providing structured and real-time data, it enhances **analytics, transparency, and user engagement** within the EcoNova ecosystem.

This project specifically indexes the following:  
✅ **PointsAdded** events (tracking reward points for users).
✅ **OwnershipTransfer** - Recording changes in contract ownership.
✅ **OrocleUpdate** - Tracking updates to the system oracle.
✅ **PointsRedeemed** - Logging when users redeem their reward points.

## **Getting Started**

### **1. Install SubQuery CLI**

First, install the SubQuery CLI globally using npm:

```sh
npm install -g @subql/cli
```

### **2. Clone the Project**

You can clone this GitHub repository:

```sh
git clone https://github.com/Imdavyking/econova/
cd econova/indexer
yarn
```

install dependencies with:

```sh
yarn install  # or npm install
```

### **3. Update .env**

Create a `.env` file in the project root and add the following variables:

```env
  RPC_URL=
  CHAIN_ID=
  CONTRACT_ADDRESS=
  BLOCK_NUMBER=
  SUBQL_ACCESS_TOKEN=
```

## **GraphQL Query Examples**

You can query indexed data with the following example:

```graphql
{
  query {
    pointsAddeds(first: 5, orderBy: BLOCK_HEIGHT_DESC) {
      nodes {
        id
        blockHeight
        user
        points
        contractAddress
      }
    }
    donations(first: 5, orderBy: BLOCK_HEIGHT_DESC) {
      nodes {
        id
        user
        token
        amount
        blockHeight
        contractAddress
      }
    }
    ownershipTransfers(first: 5, orderBy: BLOCK_HEIGHT_DESC) {
      nodes {
        id
        previousOwner
        newOwner
        blockHeight
        contractAddress
      }
    }
  }
}
```

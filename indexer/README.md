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

install dependencies with:

```sh
yarn install  # or npm install
```

---

## **Editing Your SubQuery Project**

You can modify the SubQuery project by updating the following files:

- 📄 **`project.ts`** - Defines the key project configuration and mapping handler filters.
- 📄 **`schema.graphql`** - Defines the data schema, shaping how indexed data is stored.
- 📄 **`src/mappings/`** - Contains TypeScript functions that transform and process blockchain events.

---

### **Start the SubQuery Indexer**

Run the following command to start your project:

```sh
yarn dev  # or npm run dev
```

This will:

1. 🛠 **Generate TypeScript types** from GraphQL schema and contract ABIs (`yarn codegen`).
2. 🚀 **Build the project** into the `/dist` directory (`yarn build`).
3. 🐳 **Start the indexer and database** using Docker (`docker-compose up`).

Ensure you have [Docker installed](https://docs.docker.com/engine/install) before running step 3.

Once running, open your browser and go to [http://localhost:5100](http://localhost:5100) to use the GraphQL Playground.

---

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

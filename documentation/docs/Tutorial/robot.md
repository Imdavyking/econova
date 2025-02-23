# Robot

#### **1. User Interaction with Bot Tweets**

- **Action**: Users like, retweet, or quote-tweet content from the bot's Twitter account.
- **Backend Logic**: A system monitors Twitter for user interactions with the bot's tweets.

#### **2. User Connects Twitter to Website**

- **Frontend Actions**:
  - Provide a button for users to connect their Twitter account.
  - Use Twitter's OAuth API to authenticate the user and retrieve their Twitter handle and token.
- **Backend Actions**:
  - Verify the connection and retrieve the user's Twitter ID.
  - Store the user's Twitter handle and ID securely in a database.

#### **3. Website Checks User Interaction with Bot**

- **Backend Logic**:
  - Use Twitter's API to fetch user activity related to the bot's tweets:
    - Check for likes, retweets, or quote-tweets.
    - Calculate interaction points for each action:
      - Like: 100 point
      - Retweet: 200 points
      - Quote-tweet: 300 points
  - Maintain a record of actions already counted to avoid duplicate points.
- **Storage**:
  - Store user interaction data (tweet IDs, timestamps, and action type) in a database to track progress.

#### **4. Assign Points**

- **Backend Actions**:
  - Based on the retrieved interactions, calculate the user's total points.
  - Store points in the user's profile in the database.
  - Provide an endpoint for the frontend to fetch user points.

#### **5. User Redeems Points**

- **Frontend Actions**:

  - Provide an interface showing the user's current points and a "Redeem" button.
  - On clicking "Redeem," send a request to the backend.

- **Backend Actions**:
  - Deduct redeemed points from the user's balance.
  - Mint ERC20 tokens equivalent to the redeemed points.

#### **6. Convert Points to ERC20 Tokens**

- **Blockchain Integration**:
  - Deploy an ERC20 smart contract to represent the tokens.
  - Use a function like `mint(address to, uint256 amount)` to mint tokens to the user's wallet address.
  - Notify the user via the frontend that the tokens have been sent to their wallet.

#### **7. User Receives Tokens**

- **Frontend Actions**:
  - Show the token balance in the user's connected wallet using a Web3 provider.
  - Include an option for the user to view their transaction history.

### **Components**

#### **Frontend**

- **Framework**: React.
- **Features**:
  - Twitter OAuth integration.
  - Dashboard to show points, interactions, and token balance.
  - Button to redeem points and display token transaction status.

#### **Backend**

- **Language**: Node.js.
- **Features**:
  - Twitter API integration for fetching user interactions.
  - Database (MongoDB) to store user data, interactions, and points.
  - Web3 integration to interact with the smart contract.
  - API endpoints for:
    - Authenticating Twitter accounts.
    - Fetching points.
    - Redeeming points and triggering token minting.

#### **Smart Contract**

- **Blockchain**: Ethereum or any EVM-compatible chain.
- **ERC20 Contract**:
  - Define functions for minting tokens:
    ```solidity
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    ```
  - Add any additional rules (e.g., supply cap, ownership restrictions).

#### **Integration**

- **Twitter API**:
  - Use the v2 API or Twitter Developer tools to fetch likes, retweets, and quote-tweets.
- **Web3**:
  - Use libraries like `ethers.js` or `web3.js` for smart contract interaction.
- **Authentication**:
  - Use OAuth for Twitter and wallet connection (e.g., MetaMask).

### **User Flow Summary**

1. User connects their Twitter account.
2. Website retrieves their past interactions with the bot.
3. Points are calculated and displayed on the user's dashboard.
4. User redeems points to mint ERC20 tokens.
5. Tokens are sent to the user's wallet.

## Installation

1. First, install Poetry for dependency management if you haven't already:

Follow the steps here to use the official installation: https://python-poetry.org/docs/#installing-with-the-official-installer

2. Clone the repository:

```bash
git clone  https://github.com/Imdavyking/econova
```

3. Go to the `/robot` directory:

```bash
cd econova/robot
```

4. Install dependencies:

```bash
poetry install --no-root
```

This will create a virtual environment and install all required dependencies.

## Usage

1. Activate the virtual environment:

```bash
poetry shell
```

2. Run the application:

```bash
poetry run python main.py
```

## Configure connections & launch an agent

1. Configure your desired connections:

   ```
   configure-connection twitter    # For Twitter/X integration
   configure-connection openai     # For OpenAI
   configure-connection sonic      # For Sonic
   ```

2. Use `list-connections` to see all available connections and their status

3. Load your agent (usually one is loaded by default, which can be set using the CLI or in agents/general.json):

   ```
   load-agent example
   ```

4. Start your agent:
   ```
   start
   ```

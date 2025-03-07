# EcoNova

EcoNova is a decentralized platform that integrates blockchain technology, AI, and Zero-Knowledge Proofs (ZKPs) to enable **private health verification, automated donations, AI-powered tutoring, and cross-chain transactions**. It focuses on **trustless and efficient charitable giving** while maintaining user privacy and security.  

## 🌍 **Key Integrations**

✅ **ZK-BMI verification**  
🤖 **AI-powered tutoring**  
💸 **Automated donations (powered by Gelato)**  
📢 **Social media engagement rewards (powered by Zerepy)**  
🔁 **Cross-chain transfers via deBridge & LayerZero**  
📊 **AI-powered ETH & BTC price predictions via Allora**  
🔍 **AI audit with SonicScan, GitHub Solidity analysis, and security compliance checks**

---

## 🔹 **Zero-Knowledge BMI Checker**

EcoNova uses **Zero-Knowledge Proofs (ZKPs)** to verify a person’s **Body Mass Index (BMI)** without exposing private health data, ensuring:

- **Privacy-preserving health verification** 🔒
- **Eligibility-based advice without revealing user details** 🏥

---

## 🔹 **Automated Donations via Gelato**

EcoNova automates donations using **Gelato**, a decentralized smart contract automation protocol, ensuring:

- **Gasless & trustless transactions** ⛽
- **Smart contract-driven donation scheduling** 🕒
- **Fully autonomous fund distribution** 💸
- **No reliance on manual execution** 🚀

Donors can set predefined conditions (e.g., recurring donations, impact-based donations) that execute automatically when criteria are met.

---

## 🔹 **AI Tutor (Sonic & DeFiAI)**

EcoNova features an **AI-powered tutor** to educate users on:

- **Blockchain fundamentals** 🏗️
- **Decentralized Finance (DeFi)** 💱
- **Smart contract security** 🔐

---

## 🔹 **Cross-Chain Transfers**

EcoNova enables **secure & cost-efficient cross-chain transfers** using:

### 🔀 **deBridge for Sonic-to-BSC Transfers**

💱 **deBridge** allows seamless asset transfers from **Sonic to BSC**, ensuring:

- **Fast & cost-effective transfers** ⚡
- **Improved liquidity across chains** 🔄
- **Elimination of reliance on centralized bridges** 💡

### 🔀 **LayerZero for EcoNovaToken Transfers**

🌉 **LayerZero** powers **EcoNovaToken** transfers across multiple chains, ensuring:

- **Seamless interoperability between networks** 🔗
- **Trustless and decentralized bridging** 🏦
- **Efficient cross-chain transactions for donations & rewards** 💸

---

## 🔹 **AI-Powered Price Predictions (Allora)**

EcoNova integrates **Allora AI agents** to predict **ETH and BTC price trends**, helping donors optimize contributions based on market conditions:

- **AI-driven market insights** 📈
- **Predictive analytics for crypto transfers** 🧠

---

## 🔹 **Engagement Rewards via Zerepy**

EcoNova’s **Twitter bot, EcoNova_bot**, powered by **Zerepy**, automatically:

- **Posts updates** 📢
- **Tracks user engagement (likes, retweets)** 🔍
- **Rewards users with tokens based on interactions** 🎁
- **Encourages community-driven fundraising** 🤝

⚠️ **Note:** Twitter login **will not work** due to callback URL restrictions. Ensure the frontend URL is properly configured.

---

## 📜 **Documentation**

For detailed guides, visit our **[documentation](https://econovadocs.vercel.app/)**.

---

## 📡 **Smart Contract Infrastructure**

EcoNova is deployed on **Ethereum-compatible chains** and utilizes:

- **Solidity-based smart contracts**
- **Interoperable ERC-20/ERC-721 tokens**
- **Pyth price oracles for fair value conversions**

---

## 🔐 **Security & Compliance**

- **Zero-Knowledge Proofs (ZKPs)** for private health verification
- **Decentralized fund allocation** with no single point of failure
- **Secure & trustless cross-chain transfers via deBridge & LayerZero**
- **Automated & gas-efficient donations using Gelato**

---

## 🤖 **AI Audit**

EcoNova integrates **AI-powered smart contract auditing** using:

- **[SonicScan Testnet API](https://api-testnet.sonicscan.org)** for verified contract address checks
- **GitHub Solidity file analysis** to detect vulnerabilities
- **File input support** for manual Solidity audits
- **Gas optimization suggestions** to reduce transaction costs
- **Security compliance checks** to enhance contract safety

---

## 🚀 **Start the Application**

### 1️⃣ **Start with Docker**

- **Set up secrets from `.env`**

  ```sh
  sh create-secrets.sh
  ```

📌 _Ensure the `.env` file exists and is configured in both the backend and frontend directories before running this script!_

- **Ensure Docker is installed and running.**
- **To start the backend and related services (MongoDB and Redis), run:**

  ```bash
  docker compose up
  ```

- The application will be accessible at **`localhost:3000`**.

---

## 🤝 **Contribute**

Want to help? Submit a PR or report issues via our **[GitHub](https://github.com/Imdavyking/econova/)**.

---

## 📬 **Stay Connected**

- **Twitter:** [@EcoNova_Bot](https://x.com/EcoNova_Bot)
- **Docs:** [Read the Docs](https://econovadocs.vercel.app/)
- **GitHub:** [EcoNova](https://github.com/Imdavyking/econova/)

🚀 **Join us in revolutionizing decentralized charity!**


pages

/bridge -> brigde sonic to bsc mainnet with debrigde
 -> bridge econova token to bsc testnet with layerzero


/donate -> donate to a charity cause

/dao -> defiAI goverance

/tx-analysis -> analyze transaction hash

/ai-health -> use zk proof to verify you are in a healthy bmi and store on sonic blockchain

/ai-tutor -> learn about Defi and AI, and answer quiz to claim an NFT

/ai-audit -> audit verified smart contracts,github solidity files and local files

/ai-portfolio-manager -> analyze your sonic and econova balance, set a goal and rebalance your portfolio.

/leaderboard - see ranking users based on points,also see their token balance

/earn-points - earn points by liking and retweeting post made by bot
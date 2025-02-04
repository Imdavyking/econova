# **EcoNova - Sustainable Blockchain Assistant**

**EcoNova** is an intelligent bot designed to interact with users and facilitate eco-friendly blockchain solutions. It is built to support sustainable tokenomics, green energy blockchain initiatives, and responsible digital asset management. EcoNova is highly customizable and integrates seamlessly with platforms like Telegram and Discord.

---

## **Features**

- **Sustainable Token Deployment**: Deploy eco-conscious tokens and smart contracts optimized for energy efficiency.
- **Interactive Chat**: Engage with users in a friendly, informative way across multiple platforms.
- **Eco-Friendly Insights**: Provide data on blockchain sustainability, carbon footprints, and green alternatives.
- **Support for Multiple Clients**: Works on Telegram, Discord, and more.

---

## **Setup and Installation**

### **1. Clone the Repository**

Start by cloning the repository:

```bash
git clone https://github.com/Imdavyking/econova-bot
cd econova-bot
```

### **2. Install Dependencies**

EcoNova uses **pnpm** as the package manager. Install the required dependencies by running:

```bash
pnpm install
```

### **3. Configure Your Environment**

Create a `.env` file by duplicating the example template:

```bash
cp .env.example .env
```

Edit the `.env` file and fill out the following required values:

```env
BLOCKCHAIN_ADDRESS="your-blockchain-address"
PRIVATE_KEY="your-private-key"
OPENROUTER_API_KEY="your-openrouter-api-key"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
```

Make sure you replace the placeholders with your actual values.

---

## **Character Configuration**

### **1. Modify Default Character**

You can modify EcoNova’s default character by editing the `src/character.ts` file. Uncomment and edit the character configuration to change EcoNova's appearance, bio, lore, and more.

### **2. Use Custom Characters**

To load a custom character, specify the path to your character JSON file when starting the bot:

```bash
pnpm start --characters="path/to/your/custom.character.json"
```

You can load multiple characters at once by passing an array of paths.

---

## **Add Clients**

To define which platforms EcoNova will interact with, modify the `clients` array in either `character.ts` or `character.json`:

- **In character.ts:**

  ```ts
  clients: [Clients.TELEGRAM, Clients.TWITTER];
  ```

- **In character.json:**
  ```json
  clients: ["telegram","twitter"]
  ```

---

## **Start the Bot**

After configuring the environment and character, you can start the bot by running:

```bash
pnpm start --characters="characters/bot.character.json"
```

---

## **Running EcoNova with Docker**

### **1. Build and Run Docker Compose**

For **x86_64 architecture**, follow these steps:

1. Edit the **docker-compose.yaml** file with your environment variables:

   ```yaml
   services:
     econova:
       environment:
         - OPENROUTER_API_KEY=your-openrouter-api-key
   ```

2. Run the Docker Compose setup:

   ```bash
   docker compose up
   ```

## **Contributing**

We welcome contributions! Please fork the repository, create a new branch, and submit a pull request with your changes.

---

## **License**

This project is licensed under the MIT License.

---

## **Support**

If you need any help, feel free to reach out through our Telegram or Discord channels.

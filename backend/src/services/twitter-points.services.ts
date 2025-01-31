import { ethers } from "ethers";

// Define the bot's private key and provider
const botPrivateKey = "0xYourPrivateKey"; // Replace with your bot's private key

// Create the wallet from the bot's private key
const wallet = new ethers.Wallet(botPrivateKey);

// Define the message structure
function createMessage(
  senderAddress: string,
  pointToAdd: string | number,
  nonce: string | number
) {
  return ethers.utils.solidityKeccak256(
    ["address", "uint256", "uint256"],
    [senderAddress, pointToAdd, nonce]
  );
}

// Function to sign the message
async function signMessage(
  senderAddress: string,
  pointToAdd: string | number,
  nonce: string | number
) {
  // Create the message hash
  const messageHash = createMessage(senderAddress, pointToAdd, nonce);

  // Create the Ethereum signed message hash (prefix the message for compatibility)
  const ethSignedMessageHash = ethers.utils.hashMessage(
    ethers.utils.arrayify(messageHash)
  );

  // Sign the message using the bot's private key
  const signature = await wallet.signMessage(
    ethers.utils.arrayify(ethSignedMessageHash)
  );

  return signature;
}

// Example Usage: Sign a message for a specific user and points to add
async function signForUser(
  senderAddress: string,
  pointToAdd: string | number,
  nonce: string | number
) {
  const signature = await signMessage(senderAddress, pointToAdd, nonce);

  console.log(`Signed Message for ${senderAddress}:`);
  console.log(`Signature: ${signature}`);
}

// Example to sign the message for a user with address "0xUserAddress" and 100 points to add
const senderAddress = "0xUserAddress"; // Replace with the user's Ethereum address
const pointToAdd = 100; // Points to add
const nonce = 0; // User's current nonce (this should come from the backend or a state)

signForUser(senderAddress, pointToAdd, nonce);

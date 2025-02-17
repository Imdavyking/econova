import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  getOFTSendFee,
  getProjectTokenDetails,
  sendOFTTokens,
} from "../../services/blockchain.services";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { EndpointId } from "@layerzerolabs/lz-definitions";
import { toast } from "react-toastify";

export const LZ_CHAINS = {
  84532: {
    endpointV2: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    endpointIdV2: EndpointId.BASE_V2_TESTNET,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    chainId: 84532,
  },
  57054: {
    endpointV2: "0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff",
    endpointIdV2: EndpointId.SONIC_V2_TESTNET,
    name: "Sonic Blaze",
    rpcUrl: "https://rpc.blaze.soniclabs.com",
    chainId: 57054,
  },
};

export default function Bridge() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [nativeFee, setNativeFee] = useState(null);
  const [lzTokenFee, setLzTokenFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableTokens, setAvailableTokens] = useState([]);

  const [sourceChain, setSourceChain] = useState(LZ_CHAINS[57054]); // Default to sonicBlaze
  const [destinationChain, setDestinationChain] = useState(LZ_CHAINS[84532]); // Default to baseSepolia

  const [selectedToken, setSelectedToken] = useState({
    name: "",
    symbol: "",
    tokenAddress: "",
    decimals: 18,
  });

  const filteredTokens = availableTokens.filter(
    (token) => token.chainId === sourceChain.chainId
  );

  useEffect(() => {
    getProjectTokenDetails()
      .then((token) => {
        const newTokensSet = new Set(
          availableTokens.map(
            (token) => `${token.tokenAddress}-${token.chainId}`
          )
        );

        const newToken = {
          name: token.name,
          symbol: token.symbol,
          tokenAddress: token.tokenAddress,
          decimals: token.decimals,
          chainId: 57054,
        };

        if (!newTokensSet.has(`${newToken.tokenAddress}-${newToken.chainId}`)) {
          setAvailableTokens([newToken, ...availableTokens]);
          if (!selectedToken.tokenAddress) {
            setSelectedToken(newToken);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching tokens:", error);
      });
  }, [sourceChain]);

  const estimateFee = async () => {
    try {
      setLoading(true);

      const { nativeFee, lzTokenFee } = await getOFTSendFee({
        oftTokenAddress: selectedToken.tokenAddress,
        recipientAddress: recipient,
        tokensToSend: amount * 10 ** Number(selectedToken.decimals),
        eidB: destinationChain.endpointIdV2,
      });

      setNativeFee(ethers.formatEther(nativeFee));
      setLzTokenFee(ethers.formatEther(lzTokenFee));
    } catch (error) {
      console.error("Error estimating fee:", error);
      toast.error("❌ Error estimating fee!");
    } finally {
      setLoading(false);
    }
  };

  const sendTokens = async () => {
    try {
      setLoading(true);

      await sendOFTTokens({
        oftTokenAddress: selectedToken.tokenAddress,
        recipientAddress: recipient,
        tokensToSend: amount * 10 ** Number(selectedToken.decimals),
        eidB: destinationChain.endpointIdV2,
      });

      toast.success("✅ Tokens sent successfully!");
    } catch (error) {
      console.error("Error sending tokens:", error);
      toast.error("❌ Error sending tokens!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <DarkModeSwitcher />
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Send OFT Tokens
      </h2>

      <div className="space-y-4">
        <label className="block text-gray-700 font-medium">Select Token:</label>
        <select
          className="w-full p-3 border rounded-lg text-black"
          value={selectedToken.tokenAddress}
          onChange={(e) => {
            const selected = availableTokens.find(
              (token) => token.tokenAddress === e.target.value
            );
            setSelectedToken(selected);
          }}
        >
          {filteredTokens.map((token) => (
            <option key={token.tokenAddress} value={token.tokenAddress}>
              {token.name} ({token.symbol})
            </option>
          ))}
        </select>

        <label className="block text-gray-700 font-medium">
          Select Source Blockchain:
        </label>
        <select
          className="w-full p-3 border rounded-lg text-black"
          value={sourceChain.chainId}
          onChange={(e) => setSourceChain(LZ_CHAINS[e.target.value])}
        >
          {Object.values(LZ_CHAINS).map((chain) => (
            <option key={chain.chainId} value={chain.chainId}>
              {chain.name}
            </option>
          ))}
        </select>

        <label className="block text-gray-700 font-medium">
          Select Destination Blockchain:
        </label>
        <select
          className="w-full p-3 border rounded-lg text-black"
          value={destinationChain.chainId}
          onChange={(e) => setDestinationChain(LZ_CHAINS[e.target.value])}
        >
          {Object.values(LZ_CHAINS).map((chain) => (
            <option key={chain.chainId} value={chain.chainId}>
              {chain.name}
            </option>
          ))}
        </select>

        <label className="block text-gray-700 font-medium">
          Recipient Address:
        </label>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <label className="block text-gray-700 font-medium">
          Amount to Send:
        </label>
        <input
          type="text"
          placeholder="Amount to Send"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        {nativeFee && (
          <div className="text-gray-700">
            <p>
              Native Fee: <span className="font-semibold">{nativeFee} ETH</span>
            </p>
            <p>
              LZ Token Fee:{" "}
              <span className="font-semibold">{lzTokenFee} ETH</span>
            </p>
          </div>
        )}

        <button
          className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          onClick={estimateFee}
          disabled={loading}
        >
          {loading ? "Estimating..." : "Estimate Fee"}
        </button>

        <button
          className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
          onClick={sendTokens}
          disabled={loading || !nativeFee}
        >
          {loading ? "Sending..." : "Send Tokens"}
        </button>
      </div>
    </div>
  );
}

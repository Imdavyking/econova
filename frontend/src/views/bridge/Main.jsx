import { useState, useEffect } from "react";
import { ethers, stripZerosLeft } from "ethers";
import {
  getOFTSendFee,
  getPeerTokenAddress,
  getProjectTokenDetails,
  getTokenBalance,
  rethrowFailedResponse,
  sendOFTTokens,
} from "../../services/blockchain.services";
import { HiArrowNarrowRight, HiArrowNarrowLeft } from "react-icons/hi";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { EndpointId } from "@layerzerolabs/lz-definitions";
import { toast } from "react-toastify";
import { APP_NAME, CHAIN_ID } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import { FaSpinner } from "react-icons/fa";
import { bridgeCoin, getBridgeFee } from "../../services/debridge.services";
import { sonic } from "viem/chains";
export const LZ_CHAINS = {
  // 97: {
  //   endpointV2: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  //   endpointIdV2: EndpointId.BSC_V2_TESTNET,
  //   name: "bscTestnet",
  //   rpcUrl: "https://data-seed-prebsc-2-s1.bnbchain.org:8545",
  //   chainId: 97,
  // },
  // 57054: {
  //   endpointV2: "0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff",
  //   endpointIdV2: EndpointId.SONIC_V2_TESTNET,
  //   name: "Sonic Blaze",
  //   rpcUrl: "https://rpc.blaze.soniclabs.com",
  //   chainId: 57054,
  // },
  // 56: {
  //   endpointV2: "0x1a44076050125825900e736c501f859c50fE728c",
  //   endpointIdV2: EndpointId.BSC_V2_MAINNET,
  //   name: "bscMainnet",
  //   rpcUrl: "https://rpc.ankr.com/bsc",
  //   chainId: 56,
  // },
  146: {
    endpointV2: "0x6F475642a6e85809B1c36Fa62763669b1b48DD5B",
    endpointIdV2: EndpointId.SONIC_V2_MAINNET,
    name: "Sonic Mainnet",
    rpcUrl: "https://rpc.soniclabs.com",
    chainId: 146,
  },

  137: {
    endpointV2: "0x1a44076050125825900e736c501f859c50fE728c",
    endpointIdV2: EndpointId.POLYGON_V2_MAINNET,
    name: "polygon",
    rpcUrl: "https://rpc.ankr.com/polygon",
    chainId: 137,
  },
};

export default function Bridge() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [nativeFee, setNativeFee] = useState(null);
  const [lzTokenFee, setLzTokenFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableTokens, setAvailableTokens] = useState([
    {
      name: sonic.name,
      symbol: sonic.nativeCurrency.symbol,
      tokenAddress: ethers.ZeroAddress,
      decimals: Number(18),
      chainId: sonic.id,
    },
  ]);
  const [userBalance, setUserBalance] = useState("---");
  const [sourceChain, setSourceChain] = useState(LZ_CHAINS[CHAIN_ID]); // Default to sonicBlaze
  const [destinationChain, setDestinationChain] = useState(LZ_CHAINS[CROSS_CHAIN_ID]); // Default to baseSepolia
  const [otherTokenAddress, setOtherTokenAddress] = useState("");

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
    console.log("selectedToken", selectedToken);
    getTokenBalance(selectedToken.tokenAddress, sourceChain.chainId).then(
      ({ balance, decimals }) => {
        setUserBalance(Number(balance) / 10 ** Number(decimals));
      }
    );
  }, [selectedToken, loading]);

  useEffect(() => {
    if (!sourceChain || !destinationChain || !selectedToken.tokenAddress)
      return;

    setNativeFee(null);
    setLzTokenFee(null);

    if (selectedToken.tokenAddress == ethers.ZeroAddress) {
      setOtherTokenAddress("");
      return;
    }
    getPeerTokenAddress({
      eidB: destinationChain.endpointIdV2,
      oftTokenAddress: selectedToken.tokenAddress,
      sourceChainId: sourceChain.chainId,
    })
      .then((peers) => {
        const otherChainTokenAddress = stripZerosLeft(peers);
        setOtherTokenAddress(otherChainTokenAddress);
      })
      .catch((error) => {
        console.error("Error fetching peer tokens:", error.message);
      });
  }, [sourceChain, destinationChain, selectedToken]);

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
          chainId: Number(CHAIN_ID),
        };

        if (!newTokensSet.has(`${newToken.tokenAddress}-${newToken.chainId}`)) {
          setAvailableTokens([newToken, ...availableTokens]);

          if (!selectedToken.tokenAddress) {
            console.log("called");
            setSelectedToken(newToken);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching tokens:", error);
      });
  }, []);

  const estimateFee = async () => {
    try {
      setLoading(true);
      setNativeFee(null);
      setLzTokenFee(null);

      if (recipient.trim() === "") {
        toast.error("❌ Recipient address is required!");
        return;
      }

      if (amount.trim() === "") {
        toast.error("❌ Amount is required!");
        return;
      }

      if (sourceChain.chainId === destinationChain.chainId) {
        toast.error("❌ Source and Destination chain cannot be the same!");
        return;
      }

      if (selectedToken.tokenAddress == ethers.ZeroAddress) {
        const nativeFee = await getBridgeFee(sourceChain.chainId);
        setNativeFee(ethers.formatEther(nativeFee));
      } else {
        const { nativeFee, lzTokenFee } = await getOFTSendFee({
          oftTokenAddress: selectedToken.tokenAddress,
          recipientAddress: recipient,
          tokensToSend: `${amount * 10 ** Number(selectedToken.decimals)}`,
          eidB: destinationChain.endpointIdV2,
          sourceChainId: sourceChain.chainId,
        });

        setNativeFee(ethers.formatEther(nativeFee));
        setLzTokenFee(ethers.formatEther(lzTokenFee));
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`❌ Error sending tokens: ${error.message}`);
        return;
      }
      console.error("Error estimating fee:", error);
      toast.error("❌ Error estimating fee!");
    } finally {
      setLoading(false);
    }
  };

  function camelToPascalWithSpace(str) {
    if (!str) return;
    return str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
  }

  const sendTokens = async () => {
    try {
      setLoading(true);
      if (sourceChain.chainId === destinationChain.chainId) {
        toast.error("❌ Source and Destination chain cannot be the same!");
        return;
      }
      if (selectedToken.tokenAddress == ethers.ZeroAddress) {
        const response = await bridgeCoin({
          bridgeAmount: amount,
          chainIdTo: destinationChain.chainId,
          chainIdFrom: sourceChain.chainId,
          receiver: recipient,
        });
        rethrowFailedResponse(response);
      } else {
        const response = await sendOFTTokens({
          oftTokenAddress: selectedToken.tokenAddress,
          recipientAddress: recipient,
          tokensToSend: `${amount * 10 ** Number(selectedToken.decimals)}`,
          eidB: destinationChain.endpointIdV2,
        });
        rethrowFailedResponse(response);
      }

      toast.success("✅ Tokens sent successfully!");
      setNativeFee(null);
      setLzTokenFee(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`❌ Error sending tokens: ${error.message}`);
        return;
      }
      console.error("Error sending tokens:", error);
      toast.error("❌ Error sending tokens!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container sm:px-10">
      <a href="/" className="-intro-x flex items-center pt-5 justify-center">
        <img alt="EcoNova" className="w-10" src={logoUrl} />
        <span className=" text-lg ml-3"> {APP_NAME} Bridge</span>
      </a>

      <div className="my-auto mx-auto xl:ml-20 bg-white dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-8 rounded-md shadow-md xl:shadow-none w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
        <DarkModeSwitcher />

        <div className="space-y-4">
          <select
            className="intro-x form-control py-3 px-4 block w-full mb-3"
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
                {token.name}
              </option>
            ))}
          </select>

          <select
            className="intro-x form-control py-3 px-4 block w-full mb-3"
            value={sourceChain.chainId}
            onChange={(e) => {
              setSourceChain(LZ_CHAINS[e.target.value]);
              const firstToken = availableTokens.find(
                (token) => token.chainId === +e.target.value
              );
              if (firstToken) {
                setSelectedToken(firstToken);
              }
            }}
          >
            {Object.values(LZ_CHAINS).map((chain) => (
              <option key={chain.chainId} value={chain.chainId}>
                From {camelToPascalWithSpace(chain.name)}
              </option>
            ))}
          </select>

          <select
            className="intro-x form-control py-3 px-4 block w-full mb-3"
            value={destinationChain.chainId}
            onChange={(e) => setDestinationChain(LZ_CHAINS[e.target.value])}
          >
            {Object.values(LZ_CHAINS).map((chain) => (
              <option key={chain.chainId} value={chain.chainId}>
                To {camelToPascalWithSpace(chain.name)}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="intro-x login__input form-control py-3 px-4 block"
          />

          <input
            type="text"
            placeholder="Amount to Send"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="intro-x login__input form-control py-3 px-4 block"
          />

          <div className="mb-3">
            <p className="text-sm">
              Balance:{" "}
              <span className="font-semibold">
                {userBalance === "---" || userBalance === ""
                  ? "---"
                  : userBalance}
              </span>{" "}
              {selectedToken.symbol}
            </p>
            {otherTokenAddress && (
              <p className="text-sm">
                Destination Token Address:{" "}
                <span className="font-semibold break-all">
                  {otherTokenAddress}
                </span>
              </p>
            )}
          </div>

          {nativeFee && (
            <div className="">
              <p>
                Native Fee:{" "}
                <span className="font-semibold">
                  {nativeFee} {sourceChain.name}
                </span>
              </p>

              {lzTokenFee ? (
                <p>
                  LZ Token Fee:{" "}
                  <span className="font-semibold">{lzTokenFee} </span>
                </p>
              ) : (
                <></>
              )}
            </div>
          )}

          <button
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex justify-center"
            onClick={estimateFee}
            disabled={loading}
          >
            {loading ? (
              <FaSpinner className="w-5 h-5 animate-spin" />
            ) : (
              "Estimate Fee"
            )}
          </button>

          <button
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex justify-center"
            onClick={sendTokens}
            disabled={loading || !nativeFee}
          >
            {loading ? (
              <FaSpinner className="w-5 h-5 animate-spin" />
            ) : (
              "Send Tokens"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

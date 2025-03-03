import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getBlockNumber } from "../services/blockchain.services";

export default function useCurrentBlock() {
  const [currentBlock, setCurrentBlock] = useState(null);

  useEffect(() => {
    async function fetchBlockNumber() {
      try {
        const blockNumber = await getBlockNumber();
        setCurrentBlock(blockNumber);
      } catch (error) {
        console.error("Error fetching block number:", error);
      }
    }

    fetchBlockNumber();
    const interval = setInterval(fetchBlockNumber, 5000); // Update every 5s

    return () => clearInterval(interval);
  }, []);

  return currentBlock;
}

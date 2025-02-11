import { ethers } from "ethers";
import nftCourseAbi from "../abis/course.nft.abi";
import dotenv from "dotenv";
dotenv.config();

async function getTokenURI(level: number) {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS!;

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    const contract = new ethers.Contract(
      contractAddress,
      nftCourseAbi,
      provider
    );
    const Level = {
      Beginner: 0,
      Intermediate: 1,
      Advanced: 2,
    };
    const uri = await contract.levelTokenURIs(level);
    return uri;
  } catch (error) {
    console.error("Error fetching token URI:", error);
  }
}

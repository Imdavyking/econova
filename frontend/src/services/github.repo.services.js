import { detectContractLanguage } from "./contract.detect.services";

export const fetchContractFileFromGitHub = async (githubUrl) => {
  try {
    if (!githubUrl.includes("github.com") || !githubUrl.includes("/blob/")) {
      throw new Error("Invalid GitHub URL. Please provide a valid file URL.");
    }

    // Convert GitHub URL to raw URL
    const rawUrl = githubUrl
      .replace("github.com", "raw.githubusercontent.com")
      .replace("/blob", "/refs/heads");

    console.log(rawUrl);

    // Fetch the file content
    const response = await fetch(rawUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch file. Status: ${response.status}`);
    }

    const contractCode = await response.text();

    detectContractLanguage(contractCode);

    return contractCode;
  } catch (error) {
    throw new Error(`Failed to fetch contract file: ${error.message}`);
  }
};

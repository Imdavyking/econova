export function detectContractLanguage(contractCode) {
  if (contractCode.includes("pragma solidity")) {
    console.log("✅ Detected Solidity contract");
    return "Solidity";
  } else if (
    contractCode.includes("def ") ||
    contractCode.includes("@external") ||
    contractCode.includes("@view") ||
    contractCode.includes("@payable")
  ) {
    return "Vyper";
  } else {
    throw new Error(
      "The provided file does not appear to be a Solidity or Vyper contract."
    );
  }
}

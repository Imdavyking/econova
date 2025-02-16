import { ethers } from "ethers";

import { Options } from "@layerzerolabs/lz-v2-utilities";
export async function getOFTSendFee({
  myOFTA,
  recipientAddress,
  eidB,
  tokensToSend,
}) {
  try {
    const options = Options.newOptions()
      .addExecutorLzReceiveOption(200000, 0)
      .toHex()
      .toString();

    const sendParam = [
      eidB,
      ethers.zeroPadBytes(recipientAddress, 32),
      tokensToSend,
      tokensToSend,
      options,
      "0x",
      "0x",
    ];

    const [nativeFee] = await myOFTA.quoteSend(sendParam, false);

    return { nativeFee, sendParam };
  } catch (error) {
    console.error("❌ Error calculating send fee:", error);
    throw error;
  }
}

export async function sendOFTTokens({
  myOFTA,
  refundAddress,
  recipientAddress,
  eidB,
  tokensToSend,
}) {
  try {
    const { nativeFee, sendParam } = await getOFTSendFee({
      myOFTA,
      recipientAddress,
      eidB,
      tokensToSend,
    });

    // Execute the token transfer
    const tx = await myOFTA.send(sendParam, [nativeFee, 0], refundAddress, {
      value: nativeFee,
    });
    await tx.wait();
  } catch (error) {
    console.error("❌ Error during token transfer:", error);
    throw error;
  }
}

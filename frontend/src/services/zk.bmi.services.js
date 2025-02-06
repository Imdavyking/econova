import vKey from "@/assets/json/verification_key.json";
export async function checkBMI({ weightInKg, heightInCm }) {
  const weightDecimals = 10000000;

  const { proof, publicSignals } = await window.snarkjs.groth16.fullProve(
    { height: heightInCm, weight: weightInKg * weightDecimals },
    "bmi_checker.wasm",
    "bmi_checker.zkey"
  );

  const hasValidProof = await snarkjs.groth16.verify(
    vKey,
    publicSignals,
    proof
  );

  if (hasValidProof) {
    return { proof, publicSignals };
  }
}

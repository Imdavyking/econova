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

  console.log({ hasValidProof });

  //   `const vKey = JSON.parse(fs.readFileSync("verification_key.json"));`
  // ``
  // `npx snarkjs wtns calculate build/bmi_checker_js/bmi_checker.wasm input.json witness.wtns`

  console.log("Proof: ");
  console.log(JSON.stringify(proof, null, 1));

  //   const vKey = JSON.parse(fs.readFileSync("verification_key.json"));

  //   const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  //   if (res === true) {
  //     console.log("Verification OK");
  //   } else {
  //     console.log("Invalid proof");
  //   }
}

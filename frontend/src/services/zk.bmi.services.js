import vKey from "@/assets/json/verification_key.json";
export async function checkBMI() {
  const weight = 70; // kg
  const height = 194; // cm
  const weightDecimals = 10000000;

  const { proof, publicSignals } = await window.snarkjs.groth16.fullProve(
    { height, weight: weight * weightDecimals },
    "bmi_checker.wasm",
    "bmi_checker.zkey"
  );

  console.log(proof);

  const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  console.log({ isValid });

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

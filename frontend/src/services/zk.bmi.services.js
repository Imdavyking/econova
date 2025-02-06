export async function checkBMI() {
  const weight = 70; // kg
  const height = 194; // cm
  const weightDecimals = 10000000;

  console.log({ height, weight: weight * weightDecimals });
  const { proof } = await window.snarkjs.groth16.fullProve(
    { height, weight: weight * weightDecimals },
    "bmi_checker.wasm",
    "bmi_checker.zkey"
  );

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

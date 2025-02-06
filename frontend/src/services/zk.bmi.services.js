export async function checkBMI() {
  const { proof } = await window.snarkjs.groth16.fullProve(
    { height: 10, weight: 21 },
    "bmi_checker.wasm",
    "bmi_checker.zkey"
  );

  console.log("Proof: ");
  console.log(JSON.stringify(proof, null, 1));
}

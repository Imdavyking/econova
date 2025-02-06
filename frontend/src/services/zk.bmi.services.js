import snarkjs from "snarkjs";

async function run() {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { height: 10, weight: 21 },
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

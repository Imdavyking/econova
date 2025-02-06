# BMI ZK Proof

The **BMIChecker** circuit specifically allows a party to prove that a given height and weight produce a Body Mass Index (BMI) within a healthy range (18.5 to 24.9) without revealing the exact values. The circuit enforces the correct calculation of BMI using the formula:

$$
BMI = \frac{\text{weight}}{\text{height}^2}
$$

The verification logic ensures that only valid inputs satisfying the expected BMI range will pass the check. This guarantees that a user can prove they meet the required health criteria without disclosing their exact height or weight.

## Circuit, Verifier, and Proof Setup

### Circom installation:

https://docs.circom.io/getting-started/installation/

### Circomlib (helper library) source code (it's already available in the repository for access to `poseidon.circom`):

https://github.com/iden3/circomlib/

### Reference for Poseidon hasher example - we use the Poseidon hash because it's extremely efficient for ZKPs:

https://betterprogramming.pub/zero-knowledge-proofs-using-snarkjs-and-circom-fac6c4d63202

### Dependencies:

You can get `snarkjs` and `circomlibjs` with `npm install`, and circom from the reference above

### Compiling a circuit (in the circuit's folder):

`mkdir build` <br/>
`circom circuits/bmi_checker.circom --wasm --r1cs -o ./build`

### Prepare Power of Tau

```sh
npx snarkjs powersoftau new bn128 12 pot12_0000.ptau
npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="EcoNova" --randomness="46e0b00af407k9e80d0"
npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau
npx snarkjs groth16 setup build/*.r1cs pot12_final.ptau bmi_checker.zkey
npx snarkjs zkey export verificationkey *.zkey verification_key.json
npx snarkjs zkey export solidityverifier *.zkey bmiVerifier.sol
```

### Generating proving key (zkey):

`npx snarkjs groth16 setup build/*.r1cs ../*.ptau bmi_checker.zkey` in the circuit's folder, zkey name is whatever you set

### Proof generation (adjust input values and circuit/key folder/file names as appropriate, pass integer inputs as strings to avoid problems w/BigInt):

`const { proof, publicSignals } = await snarkjs.groth16.fullProve({ "input_val": 15 }, "build/bmi_checker_js/bmi_checker.wasm", "bmi_checker.zkey");`

### Verification key generation (.json):

`npx snarkjs zkey export verificationkey *.zkey verification_key.json`

### Proof verification:

`const vKey = JSON.parse(fs.readFileSync("verification_key.json"));`
`const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);`

### Hash computation:

Circomlibjs is not very easily exposed in the browser, however it's relatively easy to use with Node:

`const poseidon = await circomlibjs.buildPoseidon();`
`const hash = poseidon.F.toString(poseidon([10]));` where `10` is a random integer input that can be expressed with 253 bits or fewer and can be `[a,b,c,d]`, etc. to hash multiple values

to be safe, each of a, b, c, etc. can be a 30-byte string that is cast to a uint256 input to the function - pass large integers like 10\*\*20 inside quotes

### Exposing Poseidon in the browser:

Exposing the Poseidon hash function in the browser client-side is not very simple - please see how this is achieved through WASM and Go in this [folder](site/client/public/poseidon)

### Solidity verifier:

`npx snarkjs zkey export solidityverifier *.zkey verifier.sol` in the circuit's folder - you can name the Solidity file differently

to prove with solidity, the proof and publicSignals need to be supplied to the smart contract

### Combined:

- `mkdir build`
- `circom circuits/bmi_checker.circom --wasm --r1cs -o ./build`
- `npx snarkjs powersoftau new bn128 12 pot12_0000.ptau`
- `npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="EcoNova" --randomness="46e0b00af407k9e80d0"`
- `npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau`
- `npx snarkjs groth16 setup build/*.r1cs pot12_final.ptau bmi_checker.zkey`
- `npx snarkjs zkey export verificationkey *.zkey verification_key.json`
- `npx snarkjs zkey export solidityverifier *.zkey bmiVerifier.sol`

Or, navigate to the target circuit folder and run `snark_setup.sh`

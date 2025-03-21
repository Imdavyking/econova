mkdir build
circom circuits/bmi_checker.circom --wasm --r1cs -o ./build
npx snarkjs powersoftau new bn128 12 pot12_0000.ptau
npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="EcoNova" --randomness="46e0b00af407k9e80d0"
npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau
npx snarkjs groth16 setup build/*.r1cs pot12_final.ptau bmi_checker.zkey
npx snarkjs zkey export verificationkey *.zkey verification_key.json
npx snarkjs zkey export solidityverifier *.zkey Groth16Verifier.sol
npx snarkjs wtns calculate build/bmi_checker_js/bmi_checker.wasm input.json witness.wtns
cp build/bmi_checker_js/bmi_checker.wasm ../frontend/public/bmi_checker.wasm
cp verification_key.json ../frontend/src/assets/json/verification_key.json
cp Groth16Verifier.sol ../contracts/contracts/zk-verifiers/Groth16Verifier.sol
cp bmi_checker.zkey ../frontend/public/bmi_checker.zkey

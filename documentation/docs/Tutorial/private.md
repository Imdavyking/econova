# BMI ZK Proof

This directory contains Zero Knowledge Proof (ZKP) circuits written in Circom, designed to allow a party to prove knowledge of secret inputs without revealing them. The circuits enable a party to generate a proof based on both public and secret inputs, ensuring that the computation's result is verifiable while keeping certain data private.

The **BMIChecker** circuit specifically allows a party to prove that a given height and weight produce a Body Mass Index (BMI) within a healthy range (18.5 to 24.9) without revealing the exact values. The circuit enforces the correct calculation of BMI using the formula:

$$
BMI = \frac{\text{weight}}{\text{height}^2}
$$


The verification logic ensures that only valid inputs satisfying the expected BMI range will pass the check. This guarantees that a user can prove they meet the required health criteria without disclosing their exact height or weight.

The circuits in this directory follow a similar pattern, focusing on proving the validity of secret inputs through computations like hashing or mathematical constraints. By structuring the circuits in this way, we provide a transparent yet privacy-preserving mechanism for verifiable claims.

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



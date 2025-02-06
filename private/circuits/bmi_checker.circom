pragma circom  2.0.0;

template BMIChecker() {

    // Declaration of signals.
    signal input height;
    signal input weight;
    signal output isHealthy;

    // BMI calculation
    signal bmi;
    // bmi <== weight / (height * height);

    // // Check if BMI is in healthy range (18.5 - 24.9)
    // isHealthy <== (bmi >= 18500) && (bmi <= 24900);
}


component main = BMIChecker();
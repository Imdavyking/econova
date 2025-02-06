pragma circom  2.0.0;

template BMIChecker() {

    // Declaration of signals.
    signal input height;
    signal input weight;
    signal input bmi;

    // BMI calculation
    bmi <== weight / (height * height);

    // BMI range check
    bmi >= 18.5;
    bmi <= 24.9;
}


component main = BMIChecker();
pragma circom  2.0.0;
include "./circomlib/circuits/comparators.circom";

template BMIChecker() {

    // Declaration of signals.
    signal input height;
    signal input weight;
    signal output isHealthy;

    // BMI calculation
    signal bmi;
    bmi <-- weight / (height * height);

    // BMI comparison
    signal bmiComparator;
    component greaterThan = GreaterThan(10);
    component lessThan = LessThan(10);

    greaterThan.in[0] <== bmi;
    greaterThan.in[1] <== 18499;

    lessThan.in[0] <== bmi;
    lessThan.in[1] <== 2500;

    isHealthy <== greaterThan.out * lessThan.out;
}


component main = BMIChecker();

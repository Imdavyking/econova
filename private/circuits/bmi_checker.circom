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

    var max = 25000;
    var min = 18499;

    greaterThan.in[0] <== bmi;
    greaterThan.in[1] <== min;

    lessThan.in[0] <== bmi;
    lessThan.in[1] <== max;

    isHealthy <== greaterThan.out * lessThan.out;
}


component main = BMIChecker();

pragma circom  2.0.0;
include "./circomlib/circuits/comparators.circom";

template BMIChecker() {

    // Declaration of signals.
    signal input height;
    signal input weight;
    signal output isHealthy;
    var max = 25000;
    var min = 18499;
    var bitWidth = 16;

    // BMI calculation
    signal bmi;
    signal x;
    signal y;
    x <== height * height;
    y <== weight * height; //TODO: change * to /
    bmi <== x;

    // BMI comparison
    component greaterThan = GreaterThan(bitWidth);
    component lessThan = LessThan(bitWidth);


    greaterThan.in[0] <== bmi;
    greaterThan.in[1] <== min;

    lessThan.in[0] <== bmi;
    lessThan.in[1] <== max;

    isHealthy <== greaterThan.out * lessThan.out;
}


component main = BMIChecker();

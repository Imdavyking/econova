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
    bmi <-- weight / (height * height);

    // BMI comparison
    // component greaterThan = GreaterThan(bitWidth);
    component lessThan = LessThan(bitWidth);


    // greaterThan.in[0] <== bmi;
    // greaterThan.in[1] <== min;

    lessThan.in[0] <== bmi;
    lessThan.in[1] <== bmi;

    isHealthy <== 0;
}


component main = BMIChecker();

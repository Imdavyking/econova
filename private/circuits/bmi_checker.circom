pragma circom  2.0.0;
include "./circomlib/circuits/comparators.circom";

function div(a, b) {
    var r = a;
    var q = 0;
    while (r >= b) {
        r = r - b;
        q = q + 1;
    }
    return q;
}

template BMIChecker() {

    // Declaration of signals.
    signal input height;
    signal input weight;
    signal output isHealthy;
    signal height_squared;
    var max = 25000;
    var min = 18499;
    var bitWidth = 16;
    component greaterThan = GreaterThan(bitWidth);
    component lessThan = LessThan(bitWidth);
    
    height_squared <== height * height;

    var bmi = div(weight, height_squared);

    greaterThan.in[0] <== bmi;
    greaterThan.in[1] <== min;

    lessThan.in[0] <== bmi;
    lessThan.in[1] <== max;

    isHealthy <== greaterThan.out * lessThan.out;
}


component main = BMIChecker();

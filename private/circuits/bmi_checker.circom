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
    var max = 25000;
    var min = 18499;
    var bitWidth = 16;
    signal bit;


   

    // BMI calculation
    signal bmi;
    var x = height * height;
    // var y = div(weight, x);
    bmi <== x;

    // BMI comparison
    component greaterThan = GreaterThan(bitWidth);
    component lessThan = LessThan(bitWidth);


    greaterThan.in[0] <== bmi;
    greaterThan.in[1] <== min;

    lessThan.in[0] <== bmi;
    lessThan.in[1] <== max;

    isHealthy <== 0;
}


component main = BMIChecker();

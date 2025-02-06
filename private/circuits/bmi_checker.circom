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

    // signal bmi <-- div(weight, height_squared);

    // log("bmi result  calculated is ",bmi);

    signal bmi_s <== 18599;

    log("min result is ",min);
    log("max result is ",max);

    greaterThan.in[0] <== bmi_s;
    greaterThan.in[1] <== min;

    log("greater result is ",greaterThan.out);

    lessThan.in[0] <== bmi_s;
    lessThan.in[1] <== max;

    log("less result is ",lessThan.out);

    isHealthy <== greaterThan.out;
}


component main = BMIChecker();

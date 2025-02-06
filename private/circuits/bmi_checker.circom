pragma circom  2.0.0;
include "./circomlib/circuits/comparators.circom";

template BMIChecker() {

    // Declaration of signals.
    signal input height;
    signal input weight;
    signal output bmi;
    signal height_squared;
    var max = 25000;
    var min = 18499;
    // var bitWidth = 16;
    // component greaterThan = GreaterThan(bitWidth);
    // component lessThan = LessThan(bitWidth);
    
    height_squared <== height * height;

    bmi <-- weight / height_squared;
    bmi * height_squared === weight;

    // greaterThan.in[0] <== bmi;
    // greaterThan.in[1] <== min;
}


component main = BMIChecker();

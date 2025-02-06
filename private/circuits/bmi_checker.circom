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
    component greaterThan = GreaterThan(bitWidth);
    component lessThan = LessThan(bitWidth);
    
    height_squared <== height * height;
    bmi * height_squared === weight;
}


component main = BMIChecker();

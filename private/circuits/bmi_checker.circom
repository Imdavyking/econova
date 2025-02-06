pragma circom  2.0.0;

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
    signal input height; // in cm(centimeters)
    signal input weight; // in kg(kilograms) * 1000
    signal output isHealthy;
    signal height_squared;
    var max = 25000;
    var min = 18499;
    
    height_squared <== height * height;

    var bmi;
    bmi = div(weight, height_squared);

    signal output inv;
    inv <-- bmi > min && bmi < max ? 1 : 0;

    log("isHealthy: ", inv);

    isHealthy <== inv;
    isHealthy === 1;
}


component main = BMIChecker();

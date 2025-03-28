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
    signal input weight; // in kg(kilograms) * 10000000(10^7)
    signal output isHealthy; // 1 if healthy, 0 if not healthy
    var max = 25000;
    var min = 18499;
    
    signal height_squared <== height * height;

    var bmi = div(weight, height_squared);

    signal output inv <-- bmi > min && bmi < max ? 1 : 0;

    log("isHealthy: ", inv);

    isHealthy <== inv;
    isHealthy === 1;
}


component main = BMIChecker();

// 70 -> weight(kg)
// 1.94 -> height(m)

const weight = 70;
const height = 194;

const heightdEcimals = height;
const Weightdecimals = weight * 10000000;

console.log(Weightdecimals);
console.log(heightdEcimals);

const bmi = Weightdecimals / (heightdEcimals * heightdEcimals);

console.log(bmi);

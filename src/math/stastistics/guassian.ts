// Desmos function: v\left(t\right)=\frac{A}{s\sqrt{2\pi}}e^{-\frac{1}{2}\left(\frac{t-u}{s}\right)^{2}}+0.3
export function probabilityDensityFunction(
    amplitudeMultiplier: number,
    mean: number,
    standardDeviation: number,
    x: number
) {
    const preExp = amplitudeMultiplier / (standardDeviation * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x + standardDeviation - mean) / standardDeviation, 2);
    return preExp * Math.exp(exponent);
}

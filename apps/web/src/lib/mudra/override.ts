/**
 * Pataka / Tripataka / Ardhapataka geometric override.
 *
 * From the approved offline experiment: a single-feature rule on
 * ring_flex_angle (t1=40, t2=71) achieved 80% accuracy on the held-out
 * 3-class subset and recovered 4/5 tripataka examples, vs. 0/5 for every
 * general classifier. This exists because the general classifier
 * systematically fails on tripataka (root cause: its training data's
 * ring-finger signal is too noisy to learn from directly).
 *
 * This override ONLY applies when the general classifier's top prediction
 * is one of these three classes -- it never overrides an unrelated mudra.
 */
const TRIAD = new Set(['pataka', 'tripataka', 'ardhpataka']);
const T1 = 40;
const T2 = 71;

export function applyPataTriTriadOverride(
    generalPrediction: string,
    ringFlexAngle: number
): { finalMudra: string; used: boolean } {
    if (!TRIAD.has(generalPrediction)) {
        return { finalMudra: generalPrediction, used: false };
    }
    let finalMudra: string;
    if (ringFlexAngle < T1) finalMudra = 'pataka';
    else if (ringFlexAngle < T2) finalMudra = 'tripataka';
    else finalMudra = 'ardhpataka';

    return { finalMudra, used: true };
}
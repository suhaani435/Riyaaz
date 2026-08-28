export interface ClassifierModel {
    classes: string[];
    feature_names: string[];
    scaler_mean: number[];
    scaler_scale: number[];
    coefficients: number[][]; // [n_classes][n_features]
    intercepts: number[];     // [n_classes]
}

let cachedModel: ClassifierModel | null = null;

export async function loadClassifier(): Promise<ClassifierModel> {
    if (cachedModel) return cachedModel;
    const res = await fetch('/models/classifier_model.json');
    if (!res.ok) throw new Error(`Failed to load classifier_model.json: ${res.status}`);
    cachedModel = (await res.json()) as ClassifierModel;
    return cachedModel;
}

function softmax(scores: number[]): number[] {
    const max = Math.max(...scores);
    const exps = scores.map((s) => Math.exp(s - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
}

/** Runs the trained multinomial Logistic Regression: standardize features
 * with the saved scaler, compute per-class linear scores, softmax.
 * Mirrors sklearn's StandardScaler + LogisticRegression exactly. */
export function predict(model: ClassifierModel, rawFeatures: number[]): { classProbs: Record<string, number>; top: string; topProb: number } {
    const standardized = rawFeatures.map(
        (v, i) => (v - model.scaler_mean[i]) / model.scaler_scale[i]
    );

    const scores = model.coefficients.map((coefRow, classIdx) => {
        let s = model.intercepts[classIdx];
        for (let j = 0; j < coefRow.length; j++) s += coefRow[j] * standardized[j];
        return s;
    });

    const probs = softmax(scores);
    const classProbs: Record<string, number> = {};
    model.classes.forEach((c, i) => { classProbs[c] = probs[i]; });

    let top = model.classes[0];
    let topProb = probs[0];
    probs.forEach((p, i) => {
        if (p > topProb) { topProb = p; top = model.classes[i]; }
    });

    return { classProbs, top, topProb };
}
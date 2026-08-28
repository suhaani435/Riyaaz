import type { Landmark } from './types';

// MediaPipe hand landmark indices (same convention as the offline Python pipeline)
const WRIST = 0;
const FINGERS: Record<string, [number, number, number, number]> = {
    thumb: [1, 2, 3, 4],
    index: [5, 6, 7, 8],
    middle: [9, 10, 11, 12],
    ring: [13, 14, 15, 16],
    pinky: [17, 18, 19, 20],
};

export const FEATURE_NAMES = [
    'thumb_flex_angle', 'index_flex_angle', 'middle_flex_angle', 'ring_flex_angle', 'pinky_flex_angle',
    'thumb_ext_ratio', 'index_ext_ratio', 'middle_ext_ratio', 'ring_ext_ratio', 'pinky_ext_ratio',
    'thumb_to_index_dist', 'thumb_to_middle_dist', 'thumb_to_ring_dist', 'thumb_to_pinky_dist',
    'spread_index_middle', 'spread_middle_ring', 'spread_ring_pinky',
    'openness_mean', 'openness_std',
] as const;

function sub(a: Landmark, b: Landmark): Landmark {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
function norm(v: Landmark): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}
function dot(a: Landmark, b: Landmark): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}
function dist(a: Landmark, b: Landmark): number {
    return norm(sub(a, b));
}

/** Wrist-relative, palm-scale-normalized landmarks. Must match the Python
 * extraction exactly: translate by wrist (landmark 0), scale by the
 * wrist -> middle-MCP (landmark 9) distance. */
export function normalizeLandmarks(landmarks: Landmark[]): Landmark[] {
    const wrist = landmarks[0];
    const mcp9 = landmarks[9];
    let scale = dist(wrist, mcp9);
    if (scale <= 1e-9) scale = 1.0;
    return landmarks.map((p) => ({
        x: (p.x - wrist.x) / scale,
        y: (p.y - wrist.y) / scale,
        z: (p.z - wrist.z) / scale,
    }));
}

function angleAt(a: Landmark, b: Landmark, c: Landmark): number {
    const v1 = sub(a, b);
    const v2 = sub(c, b);
    let cosA = dot(v1, v2) / (norm(v1) * norm(v2) + 1e-9);
    cosA = Math.max(-1, Math.min(1, cosA));
    return (Math.acos(cosA) * 180) / Math.PI;
}

function flexionAngle(lm: Landmark[], ids: [number, number, number, number]): number {
    const [mcpI, pipI, dipI] = ids;
    const raw = angleAt(lm[mcpI], lm[pipI], lm[dipI]);
    return 180.0 - raw; // 0 = straight/extended, higher = curled
}

function extensionRatio(lm: Landmark[], ids: [number, number, number, number]): number {
    const wrist = lm[WRIST];
    const tip = lm[ids[3]];
    const mcp = lm[ids[0]];
    return dist(tip, wrist) / (dist(mcp, wrist) + 1e-9);
}

/** Computes the same 19 geometric features as the offline Python pipeline,
 * in the same order as FEATURE_NAMES. Input must already be normalized
 * via normalizeLandmarks(). */
export function extractFeatures(lm: Landmark[]): number[] {
    const flex: Record<string, number> = {};
    const ext: Record<string, number> = {};
    for (const [name, ids] of Object.entries(FINGERS)) {
        flex[name] = flexionAngle(lm, ids as [number, number, number, number]);
        ext[name] = extensionRatio(lm, ids as [number, number, number, number]);
    }

    const thumbTip = lm[FINGERS.thumb[3]];
    const thumbDist: Record<string, number> = {};
    for (const name of ['index', 'middle', 'ring', 'pinky']) {
        thumbDist[name] = dist(thumbTip, lm[FINGERS[name][3]]);
    }

    const tips = {
        index: lm[FINGERS.index[3]],
        middle: lm[FINGERS.middle[3]],
        ring: lm[FINGERS.ring[3]],
        pinky: lm[FINGERS.pinky[3]],
    };
    const spreadIM = dist(tips.index, tips.middle);
    const spreadMR = dist(tips.middle, tips.ring);
    const spreadRP = dist(tips.ring, tips.pinky);

    const allExt = ['thumb', 'index', 'middle', 'ring', 'pinky'].map((n) => ext[n]);
    const opennessMean = allExt.reduce((a, b) => a + b, 0) / allExt.length;
    const opennessVar =
        allExt.reduce((a, b) => a + (b - opennessMean) ** 2, 0) / allExt.length;
    const opennessStd = Math.sqrt(opennessVar);

    return [
        flex.thumb, flex.index, flex.middle, flex.ring, flex.pinky,
        ext.thumb, ext.index, ext.middle, ext.ring, ext.pinky,
        thumbDist.index, thumbDist.middle, thumbDist.ring, thumbDist.pinky,
        spreadIM, spreadMR, spreadRP,
        opennessMean, opennessStd,
    ];
}

/** Convenience: named feature lookup, for the correction engine. */
export function featuresAsMap(values: number[]): Record<string, number> {
    const map: Record<string, number> = {};
    FEATURE_NAMES.forEach((name, i) => { map[name] = values[i]; });
    return map;
}
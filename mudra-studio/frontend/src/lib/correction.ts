import type { CorrectionItem, CorrectionStatus } from './type';
interface FingerConfig {
    enabled: boolean;
    mean: number;
    std: number;
    z_threshold: number;
}
export type CorrectionConfig = Record<string, Record<string, FingerConfig>>;

let cachedConfig: CorrectionConfig | null = null;

export async function loadCorrectionConfig(): Promise<CorrectionConfig> {
    if (cachedConfig) return cachedConfig;
    const res = await fetch('/models/correction_config.json');
    if (!res.ok) throw new Error(`Failed to load correction_config.json: ${res.status}`);
    cachedConfig = (await res.json()) as CorrectionConfig;
    return cachedConfig;
}

const FINGERS: Array<'thumb' | 'index' | 'middle' | 'ring' | 'pinky'> = [
    'thumb', 'index', 'middle', 'ring', 'pinky',
];

const CAUTIOUS_MESSAGES: Record<string, string> = {
    more_curled: 'looks slightly more curled than expected',
    more_extended: 'looks slightly straighter/more extended than expected',
};

/** Only the validated curl/extension correction category is implemented.
 * Thumb-opposition, finger-spread, and hand-orientation corrections are
 * NOT implemented -- those are uncalibrated per the approved calibration
 * report and must not be shown to users yet. */
export function computeCorrections(
    config: CorrectionConfig,
    mudra: string,
    featureMap: Record<string, number>
): { status: CorrectionStatus; corrections: CorrectionItem[] } {
    const mudraConfig = config[mudra];
    if (!mudraConfig) {
        return { status: 'disabled_for_mudra', corrections: [] };
    }

    const anyEnabled = FINGERS.some((f) => mudraConfig[f]?.enabled);
    if (!anyEnabled) {
        // Tripataka, and ardhpataka's index/middle individually, land here.
        return { status: 'disabled_for_mudra', corrections: [] };
    }

    const corrections: CorrectionItem[] = [];
    for (const finger of FINGERS) {
        const fc = mudraConfig[finger];
        if (!fc || !fc.enabled) continue;
        const value = featureMap[`${finger}_flex_angle`];
        if (value === undefined) continue;
        const z = (value - fc.mean) / (fc.std || 1e-9);
        if (Math.abs(z) > fc.z_threshold) {
            const direction = z > 0 ? 'more_curled' : 'more_extended';
            corrections.push({
                finger,
                direction,
                message: `Your ${finger} finger ${CAUTIOUS_MESSAGES[direction]} for ${mudra}. Try ${direction === 'more_curled' ? 'straightening' : 'curling'
                    } it slightly.`,
            });
        }
    }

    return {
        status: corrections.length > 0 ? 'worth_checking' : 'clean',
        corrections,
    };
}
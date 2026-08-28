export interface Landmark {
    x: number;
    y: number;
    z: number;
}

export interface CorrectionItem {
    finger: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
    direction: 'more_curled' | 'more_extended';
    message: string;
}

export type CorrectionStatus = 'clean' | 'worth_checking' | 'disabled_for_mudra';

export interface RecognitionResult {
    mudra: string;
    recognitionConfidence: number;
    correctionStatus: CorrectionStatus;
    corrections: CorrectionItem[];
    usedOverride: boolean;
}

export type PipelineStatus =
    | 'idle'
    | 'requesting_camera'
    | 'camera_denied'
    | 'no_camera'
    | 'loading_model'
    | 'model_load_failed'
    | 'running_no_hand'
    | 'running_uncertain'
    | 'running_recognized';
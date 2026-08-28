export interface Landmark {
    x: number;
    y: number;
    z: number;
}

export type PipelineStatus =
    | 'idle'
    | 'requesting_camera'
    | 'loading_model'
    | 'ready'
    | 'running'
    | 'running_no_hand'
    | 'running_uncertain'
    | 'running_recognized'
    | 'camera_denied'
    | 'no_camera'
    | 'model_load_failed'
    | 'error';

export type CorrectionStatus =
    | 'clean'
    | 'worth_checking'
    | 'disabled_for_mudra';

export interface CorrectionItem {
    finger: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
    direction: 'more_curled' | 'more_extended';
    message: string;
}

export interface RecognitionResult {
    mudra: string;
    recognitionConfidence: number;
    correctionStatus: CorrectionStatus;
    corrections: CorrectionItem[];
    usedOverride?: boolean;
}
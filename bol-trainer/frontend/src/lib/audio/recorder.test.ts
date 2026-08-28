import { afterEach, describe, expect, it, vi } from "vitest";
import { isRecordingSupported, pickSupportedMimeType } from "./recorder";

/**
 * These tests cover the two pieces of Phase 3 logic that are
 * deterministic and don't require a real microphone: MIME-type
 * fallback selection and browser-support detection. They mock the
 * global MediaRecorder/navigator objects; they do NOT prove that
 * real microphone capture works end-to-end in an actual browser —
 * that still has to be verified manually (see the project notes).
 */

function setMediaRecorderSupport(supportedTypes: string[] | undefined): void {
    if (supportedTypes === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (globalThis as any).MediaRecorder;
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).MediaRecorder = {
        isTypeSupported: (type: string) => supportedTypes.includes(type),
    };
}

function setNavigatorMediaDevices(getUserMedia: (() => Promise<unknown>) | undefined): void {
    // Node defines a built-in, non-writable `navigator` global, so a
    // plain assignment throws — Object.defineProperty overrides it.
    Object.defineProperty(globalThis, "navigator", {
        value: { mediaDevices: getUserMedia ? { getUserMedia } : undefined },
        configurable: true,
        writable: true,
    });
}

afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).MediaRecorder;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).navigator;
});

describe("pickSupportedMimeType", () => {
    it("returns null when MediaRecorder does not exist", () => {
        setMediaRecorderSupport(undefined);
        expect(pickSupportedMimeType()).toBeNull();
    });

    it("prefers audio/webm;codecs=opus when the browser supports it", () => {
        setMediaRecorderSupport(["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]);
        expect(pickSupportedMimeType()).toBe("audio/webm;codecs=opus");
    });

    it("falls back to audio/mp4 for Safari-style support", () => {
        setMediaRecorderSupport(["audio/mp4"]);
        expect(pickSupportedMimeType()).toBe("audio/mp4");
    });

    it("returns null when none of the candidate types are supported", () => {
        setMediaRecorderSupport([]);
        expect(pickSupportedMimeType()).toBeNull();
    });
});

describe("isRecordingSupported", () => {
    it("is false when getUserMedia is unavailable", () => {
        setNavigatorMediaDevices(undefined);
        setMediaRecorderSupport(["audio/webm"]);
        expect(isRecordingSupported()).toBe(false);
    });

    it("is false when MediaRecorder is unavailable", () => {
        setNavigatorMediaDevices(vi.fn());
        setMediaRecorderSupport(undefined);
        expect(isRecordingSupported()).toBe(false);
    });

    it("is true when both getUserMedia and MediaRecorder exist", () => {
        setNavigatorMediaDevices(vi.fn());
        setMediaRecorderSupport(["audio/webm"]);
        expect(isRecordingSupported()).toBe(true);
    });
});
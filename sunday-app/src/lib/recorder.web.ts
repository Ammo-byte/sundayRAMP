/**
 * recorder.web.ts — browser implementation using the MediaRecorder API.
 * Metro automatically picks this file over recorder.ts on web.
 */
import React from "react";
import type { Recorder, RecorderState, StopResult } from "./recorder";

export type { RecorderState, StopResult, Recorder };

function getPreferredMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/mp4",
    "audio/webm",
  ];

  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? "";
}

export function useRecorder(): Recorder {
  const [isRecording, setIsRecording] = React.useState(false);
  const [durationMillis, setDurationMillis] = React.useState(0);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const startTimeRef = React.useRef<number | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const start = React.useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getPreferredMimeType();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    chunksRef.current = [];
    streamRef.current = stream;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    startTimeRef.current = Date.now();
    setIsRecording(true);
    intervalRef.current = setInterval(() => {
      setDurationMillis(startTimeRef.current ? Date.now() - startTimeRef.current : 0);
    }, 200);
  }, []);

  const stop = React.useCallback((): Promise<StopResult> => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      const stream = streamRef.current;

      if (!recorder) {
        reject(new Error("No active recording."));
        return;
      }

      const cleanup = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        mediaRecorderRef.current = null;
        streamRef.current = null;
        startTimeRef.current = null;
        setIsRecording(false);
        setDurationMillis(0);
        (stream ?? recorder.stream).getTracks().forEach((track) => track.stop());
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        chunksRef.current = [];
        cleanup();
        if (blob.size <= 0) {
          reject(new Error("Recorded audio was empty. Please try again."));
          return;
        }
        resolve({ blob, durationMillis: duration });
      };

      recorder.onerror = () => {
        cleanup();
        reject(new Error("Browser audio recording failed. Please try again."));
      };

      try {
        recorder.requestData();
      } catch {
        // Some browsers only flush when stop() is called.
      }

      recorder.stop();
    });
  }, []);

  return {
    state: { isRecording, durationMillis },
    start,
    stop,
  };
}

/**
 * recorder.web.ts — browser implementation using the MediaRecorder API.
 * Metro automatically picks this file over recorder.ts on web.
 */
import React from "react";
import type { Recorder, RecorderState, StopResult } from "./recorder";

export type { RecorderState, StopResult, Recorder };

export function useRecorder(): Recorder {
  const [isRecording, setIsRecording] = React.useState(false);
  const [durationMillis, setDurationMillis] = React.useState(0);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const startTimeRef = React.useRef<number | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const start = React.useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const recorder = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start(100);
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

      if (!recorder) {
        reject(new Error("No active recording."));
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        chunksRef.current = [];
        resolve({ blob, durationMillis: duration });
      };

      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());

      if (intervalRef.current) clearInterval(intervalRef.current);
      mediaRecorderRef.current = null;
      startTimeRef.current = null;
      setIsRecording(false);
      setDurationMillis(0);
    });
  }, []);

  return {
    state: { isRecording, durationMillis },
    start,
    stop,
  };
}

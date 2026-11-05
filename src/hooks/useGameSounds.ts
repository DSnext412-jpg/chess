import { useEffect, useRef } from 'react';
import type { GameSnapshot } from '../types/chess';
import {
  playCaptureSound,
  playCheckSound,
  playEndSound,
  playMoveSound,
} from '../lib/sound';

export function useGameSounds(snapshot: GameSnapshot, enabled: boolean): void {
  const previous = useRef<GameSnapshot | null>(null);

  useEffect(() => {
    const last = previous.current;
    previous.current = snapshot;
    if (!enabled || !last) return;
    if (last.seq === snapshot.seq) return;

    const previousCaptured = last.captured.w.length + last.captured.b.length;
    const nextCaptured = snapshot.captured.w.length + snapshot.captured.b.length;

    if (snapshot.result && !last.result) {
      playEndSound();
      return;
    }
    if (snapshot.history.length < last.history.length) return;
    if (snapshot.history.length === last.history.length) return;

    if (snapshot.check && !last.check) {
      playCheckSound();
      return;
    }
    if (nextCaptured > previousCaptured) {
      playCaptureSound();
      return;
    }
    playMoveSound();
  }, [snapshot, enabled]);
}

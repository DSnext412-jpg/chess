import { useState } from 'react';
import type { BoardThemeId, PieceThemeId } from '../lib/themes';

export interface Preferences {
  sound: boolean;
  legalHints: boolean;
  boardTheme: BoardThemeId;
  pieceTheme: PieceThemeId;
  flipped: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  sound: true,
  legalHints: true,
  boardTheme: 'walnut',
  pieceTheme: 'ivory',
  flipped: false,
};

export function usePreferences() {
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);

  const update = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const toggleFlip = () => {
    setPreferences((current) => ({ ...current, flipped: !current.flipped }));
  };

  return { preferences, update, toggleFlip };
}

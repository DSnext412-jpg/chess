import { useSyncExternalStore } from 'react';
import type { Color, MovementMode, Square } from '../types/chess';
import type { PromotionPiece } from '../lib/gameEngine';
import type { RequestType } from '../types/protocol';
import { sessionManager } from '../session/SessionManager';

export interface SessionActions {
  hostRoom: (name: string, mode: MovementMode) => void;
  joinRoom: (code: string, name: string) => void;
  move: (from: Square, to: Square, promotion?: PromotionPiece) => void;
  requestAction: (
    type: RequestType,
    payload?: { mode: MovementMode },
  ) => void;
  respondRequest: (accept: boolean) => void;
  resign: () => void;
  offerDraw: () => void;
  endSession: () => void;
  retry: () => void;
  reset: () => void;
  reconnect: () => void;
  changeWaitingMode: (mode: MovementMode) => void;
  clearNotice: () => void;
  getInviteLink: () => string;
}

const actions: SessionActions = {
  hostRoom: (name, mode) => sessionManager.hostRoom(name, mode),
  joinRoom: (code, name) => sessionManager.joinRoom(code, name),
  move: (from, to, promotion) => sessionManager.move(from, to, promotion),
  requestAction: (type, payload) =>
    sessionManager.requestAction(type, payload),
  respondRequest: (accept) => sessionManager.respondRequest(accept),
  resign: () => sessionManager.resign(),
  offerDraw: () => sessionManager.offerDraw(),
  endSession: () => sessionManager.endSession(),
  retry: () => sessionManager.retry(),
  reset: () => sessionManager.reset(),
  reconnect: () => sessionManager.reconnect(),
  changeWaitingMode: (mode) => sessionManager.changeWaitingMode(mode),
  clearNotice: () => sessionManager.clearNotice(),
  getInviteLink: () => sessionManager.getInviteLink(),
};

export function useSession() {
  const state = useSyncExternalStore(
    sessionManager.subscribe,
    sessionManager.getState,
    sessionManager.getState,
  );

  const myColor: Color | null = state.role
    ? state.role === 'host'
      ? state.hostColor
      : state.guestColor
    : null;

  return { state, myColor, actions };
}

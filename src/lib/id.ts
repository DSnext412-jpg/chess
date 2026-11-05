const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createRoomCode(length = 6): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ROOM_ALPHABET[bytes[i] % ROOM_ALPHABET.length];
  }
  return code;
}

export function createToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

let counter = 0;

export function createPieceId(prefix = 'p'): string {
  counter += 1;
  const rand =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${counter}-${rand}`;
}

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeRoomCode(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
}

export function isValidRoomCode(value: string): boolean {
  return /^[A-HJ-NP-Z2-9]{6}$/.test(value.toUpperCase());
}

export function peerIdForRoom(code: string): string {
  return `chess-session-${code.toLowerCase()}`;
}

export function inviteLink(code: string): string {
  if (typeof window === 'undefined') return `#/join/${code}`;
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/join/${code}`;
}

export function sanitizeName(value: string, fallback = 'Player'): string {
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20);
  return cleaned || fallback;
}

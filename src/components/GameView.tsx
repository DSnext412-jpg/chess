import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Copy,
  Handshake,
  Link2,
  Loader2,
  LogOut,
  RotateCcw,
  Share2,
  Swords,
  Trophy,
  WifiOff,
} from 'lucide-react';
import type { Preferences } from '../hooks/usePreferences';
import type { Color, GameResult, PieceType } from '../types/chess';
import { PIECE_VALUES } from '../types/chess';
import { useSession } from '../hooks/useSession';
import { useGameSounds } from '../hooks/useGameSounds';
import { BOARD_THEMES, PIECE_THEMES } from '../lib/themes';
import { copyText } from '../lib/clipboard';
import { ChessBoard } from './ChessBoard';
import { ChessPiece } from './ChessPiece';
import { PlayerInfo } from './PlayerInfo';
import { CapturedPieces } from './CapturedPieces';
import { MoveHistory } from './MoveHistory';
import { GameControls } from './GameControls';
import { GameSettings } from './GameSettings';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { ConnectionBadge } from './ui/ConnectionBadge';

interface GameViewProps {
  preferences: Preferences;
  update: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  toggleFlip: () => void;
}

function materialSum(pieces: PieceType[]): number {
  return pieces.reduce((total, piece) => total + PIECE_VALUES[piece], 0);
}

function resultCopy(
  result: GameResult,
  myColor: Color,
  meName: string,
  opponentName: string,
): { title: string; detail: string; won: boolean; draw: boolean } {
  if (!result.winner) {
    return {
      title: 'Draw',
      detail:
        result.type === 'stalemate'
          ? 'Stalemate — no legal moves remain.'
          : result.reason,
      won: false,
      draw: true,
    };
  }
  const won = result.winner === myColor;
  const winnerName = won ? meName : opponentName;
  const loserName = won ? opponentName : meName;
  let detail = result.reason;
  if (result.type === 'checkmate') detail = `Checkmate by ${winnerName}.`;
  if (result.type === 'resignation') detail = `${loserName} resigned.`;
  return { title: won ? 'You win' : `${winnerName} wins`, detail, won, draw: false };
}

export function GameView({
  preferences,
  update,
  toggleFlip,
}: GameViewProps) {
  const { state, myColor, actions } = useSession();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useGameSounds(state.snapshot, preferences.sound);

  const connected = state.status === 'connected';
  const gameOver = !!state.snapshot.result;
  const isHost = state.role === 'host';
  const meName = isHost ? state.hostName : state.guestName;
  const opponentName = isHost ? state.guestName : state.hostName;
  const color = myColor ?? (isHost ? state.hostColor : state.guestColor);
  const opponentColor: Color = color === 'w' ? 'b' : 'w';
  const opponentOnline = connected;
  const myAdvantage =
    materialSum(state.snapshot.captured[opponentColor]) -
    materialSum(state.snapshot.captured[color]);
  const opponentAdvantage = -myAdvantage;
  const boardTheme = BOARD_THEMES[preferences.boardTheme];
  const pieceTheme = PIECE_THEMES[preferences.pieceTheme];
  const pending = !!(state.incomingRequest || state.outgoingRequest);
  const interactive = connected && !gameOver && !pending;

  const copy = async (kind: 'code' | 'link') => {
    const value =
      kind === 'code' ? state.roomCode ?? '' : actions.getInviteLink();
    if (!value) return;
    const ok = await copyText(value);
    if (ok) {
      setCopied(kind);
      setTimeout(() => setCopied(null), 1800);
    }
  };

  const share = async () => {
    const link = actions.getInviteLink();
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chess Session',
          text: `Join my private chess room ${state.roomCode}`,
          url: link,
        });
        return;
      } catch {
        /* fall back to copy */
      }
    }
    void copy('link');
  };

  const incoming = state.incomingRequest;
  const requestFrom = incoming?.from === 'host' ? state.hostName : state.guestName;
  const incomingCopy = (() => {
    if (!incoming) return null;
    switch (incoming.requestType) {
      case 'undo':
        return {
          title: 'Undo requested',
          description: `${requestFrom} would like to take back the last move.`,
          body: 'If you accept, the most recent move is reverted for both players.',
        };
      case 'restart':
        return {
          title: 'Restart requested',
          description: `${requestFrom} would like to restart the game.`,
          body: 'The board returns to the starting position. Colors stay the same.',
        };
      case 'new-game':
        return {
          title: 'New game requested',
          description: `${requestFrom} would like to start a new game.`,
          body: 'The board resets to the starting position and both players swap colors.',
        };
      case 'mode':
        return {
          title: 'Rules change requested',
          description: `${requestFrom} wants to switch the movement rules.`,
          body:
            incoming.payload?.mode === 'free'
              ? 'Free Movement: any piece can move anywhere on any turn. A new game starts from the initial position.'
              : 'Standard Chess: legal moves, checks, castling and promotions apply. A new game starts from the initial position.',
        };
      case 'draw':
        return {
          title: 'Draw offered',
          description: `${requestFrom} offers a draw.`,
          body: 'If you accept, the game ends immediately as a draw.',
        };
    }
  })();

  const result = state.snapshot.result
    ? resultCopy(state.snapshot.result, color, meName, opponentName)
    : null;

  const outgoingLabel = (() => {
    switch (state.outgoingRequest?.requestType) {
      case 'draw':
        return 'draw offer';
      case 'undo':
        return 'undo request';
      case 'restart':
        return 'restart request';
      case 'new-game':
        return 'new game request';
      case 'mode':
        return 'rules change';
      default:
        return 'request';
    }
  })();

  const sidebar = (
    <>
      <CapturedPieces captured={state.snapshot.captured} pieceTheme={pieceTheme} />
      <MoveHistory snapshot={state.snapshot} pieceTheme={pieceTheme} />
      <GameControls toggleFlip={toggleFlip} />
      <GameSettings
        preferences={preferences}
        update={update}
        toggleFlip={toggleFlip}
      />
    </>
  );

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-0 h-[420px] w-[520px] rounded-full bg-gold-500/[0.05] blur-[130px]" />
        <div className="absolute bottom-0 right-[4%] h-[360px] w-[440px] rounded-full bg-[#3a2a18]/25 blur-[120px]" />
        <div className="bg-fine-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/[0.055] bg-ink-950/75 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-3 sm:h-[76px]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold-400/25 bg-gradient-to-br from-gold-300/15 via-white/[0.03] to-transparent">
                <ChessPiece
                  type="n"
                  color="w"
                  theme={PIECE_THEMES.ivory}
                  className="h-6 w-6 translate-y-px"
                />
              </span>
              <span className="hidden leading-none sm:block">
                <span className="block font-display text-xl font-semibold tracking-wide text-ivory-50">
                  Chess Session
                </span>
                <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.28em] text-gold-300/55">
                  Live game
                </span>
              </span>
            </div>
            <span className="hidden h-6 w-px bg-white/10 md:block" />
            <span className="hidden text-[11px] font-medium text-ivory-200/40 md:block">
              {state.snapshot.mode === 'free'
                ? 'Free Movement'
                : 'Standard Chess'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void copy('code')}
              className="group hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 transition hover:border-gold-400/30 hover:bg-white/[0.06] md:flex"
              title="Copy room code"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-ivory-200/30">
                Room
              </span>
              <span className="font-mono text-[12px] font-semibold tracking-[0.2em] text-ivory-100/80">
                {state.roomCode}
              </span>
              {copied === 'code' ? (
                <Check className="h-3 w-3 text-emerald-300" />
              ) : (
                <Copy className="h-3 w-3 text-ivory-200/30 transition group-hover:text-gold-300" />
              )}
            </button>

            <span className="hidden sm:inline-block">
              <ConnectionBadge status={state.status} />
            </span>
            <span className="sm:hidden">
              <ConnectionBadge status={state.status} compact />
            </span>

            <button
              type="button"
              onClick={() => void share()}
              className="icon-btn"
              title="Share invitation"
              aria-label="Share invitation"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => void copy('link')}
              className="icon-btn hidden sm:inline-flex"
              title="Copy invitation link"
              aria-label="Copy invitation link"
            >
              {copied === 'link' ? (
                <Check className="h-4 w-4 text-emerald-300" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setConfirmLeave(true)}
              className="icon-btn text-red-200/70 hover:border-red-400/30 hover:text-red-200"
              title="Leave the room"
              aria-label="Leave the room"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="container-page pb-16 pt-5 sm:pt-7">
        {!connected && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.055] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/[0.08]">
                {state.status === 'reconnecting' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-amber-200/80" />
                ) : (
                  <WifiOff className="h-4 w-4 text-amber-200/80" />
                )}
              </span>
              <div>
                <p className="text-[12px] font-semibold text-amber-100/90">
                  {state.status === 'reconnecting'
                    ? 'Connection interrupted — reconnecting…'
                    : 'Your opponent is offline.'}
                </p>
                <p className="mt-0.5 text-[10.5px] leading-4 text-amber-100/45">
                  The board is preserved. Moves are paused until the connection
                  is restored.
                </p>
              </div>
            </div>
            {!isHost && state.canRetry && state.status !== 'reconnecting' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={actions.reconnect}
                className="shrink-0"
              >
                Reconnect
              </Button>
            )}
          </motion.div>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_330px] xl:gap-7">
          <section className="mx-auto w-full max-w-[700px] lg:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <PlayerInfo
                name={opponentName || 'Waiting for opponent'}
                color={opponentColor}
                isMe={false}
                online={opponentOnline}
                isTurn={state.snapshot.turn === opponentColor}
                mode={state.snapshot.mode}
                gameOver={gameOver}
                advantage={Math.max(0, opponentAdvantage)}
              />

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative overflow-hidden rounded-2xl border px-4 py-3 ${
                    result.draw
                      ? 'border-white/[0.12] bg-white/[0.04]'
                      : result.won
                        ? 'border-gold-400/30 bg-gradient-to-r from-gold-400/[0.11] to-transparent'
                        : 'border-red-400/20 bg-gradient-to-r from-red-500/[0.07] to-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                          result.draw
                            ? 'border-white/10 bg-white/[0.04] text-ivory-200/60'
                            : result.won
                              ? 'border-gold-400/25 bg-gold-400/[0.09] text-gold-200'
                              : 'border-red-400/20 bg-red-400/[0.07] text-red-200/70'
                        }`}
                      >
                        {result.draw ? (
                          <Handshake className="h-4 w-4" />
                        ) : (
                          <Trophy className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-ivory-50">
                          {result.title}
                        </p>
                        <p className="truncate text-[10px] text-ivory-200/45">
                          {result.detail}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => actions.requestAction('new-game')}
                        disabled={!connected || pending}
                        icon={<RotateCcw className="h-3 w-3" />}
                      >
                        Rematch
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {state.outgoingRequest && (
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10.5px] text-ivory-200/45">
                  <Loader2 className="h-3 w-3 animate-spin text-gold-300/70" />
                  Waiting for {opponentName} to respond to your {outgoingLabel}
                  …
                </div>
              )}

              <ChessBoard
                snapshot={state.snapshot}
                boardTheme={boardTheme}
                pieceTheme={pieceTheme}
                myColor={color}
                flippedPreference={preferences.flipped}
                legalHints={preferences.legalHints}
                interactive={interactive}
                onMove={actions.move}
              />

              <PlayerInfo
                name={meName}
                color={color}
                isMe
                online={state.phase === 'playing'}
                isTurn={state.snapshot.turn === color}
                mode={state.snapshot.mode}
                gameOver={gameOver}
                advantage={Math.max(0, myAdvantage)}
              />
            </motion.div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-black/20 px-3.5 py-2">
              <div className="flex min-w-0 items-center gap-2 text-[10px] text-ivory-200/35">
                <Swords className="h-3 w-3 shrink-0 text-gold-300/50" />
                <span className="truncate">
                  {state.snapshot.mode === 'free'
                    ? 'Free movement — piece colors and turns are unrestricted.'
                    : state.snapshot.check
                      ? 'Check — your king is under attack.'
                      : `Move ${Math.floor(state.snapshot.history.length / 2) + 1} · ${
                          state.snapshot.turn === 'w' ? 'White' : 'Black'
                        } to move`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void copy('code')}
                className="shrink-0 font-mono text-[10px] font-semibold tracking-[0.2em] text-gold-300/60 transition hover:text-gold-200 md:hidden"
              >
                {state.roomCode}
              </button>
            </div>

            <div className="mt-4 space-y-4 lg:hidden">{sidebar}</div>
          </section>

          <aside className="hidden space-y-4 lg:block">{sidebar}</aside>
        </div>
      </main>

      <Dialog
        open={!!incoming}
        onClose={() => undefined}
        dismissible={false}
        title={incomingCopy?.title ?? 'Request'}
        description={incomingCopy?.description}
        footer={
          <>
            <Button variant="ghost" onClick={() => actions.respondRequest(false)}>
              Decline
            </Button>
            <Button onClick={() => actions.respondRequest(true)}>
              Accept
            </Button>
          </>
        }
      >
        {incomingCopy && (
          <div className="rounded-xl border border-gold-400/15 bg-gold-400/[0.04] p-4 text-[12px] leading-6 text-ivory-200/55">
            {incomingCopy.body}
          </div>
        )}
      </Dialog>

      <Dialog
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        title="Leave the session?"
        description="The temporary room closes for both players. The board and move history are not saved."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmLeave(false)}>
              Stay
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmLeave(false);
                actions.endSession();
              }}
              icon={<LogOut className="h-4 w-4" />}
            >
              End session
            </Button>
          </>
        }
      />
    </div>
  );
}

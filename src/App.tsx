import { useEffect, useMemo, useState } from 'react';
import { useSession } from './hooks/useSession';
import { usePreferences } from './hooks/usePreferences';
import { normalizeRoomCode } from './lib/id';
import { HomePage } from './components/HomePage';
import { CreateRoom } from './components/CreateRoom';
import { JoinRoom } from './components/JoinRoom';
import { WaitingRoom } from './components/WaitingRoom';
import { GameView } from './components/GameView';
import { SessionEnded } from './components/SessionEnded';
import { ErrorPage } from './components/ErrorPage';
import { ExpiredRoom } from './components/ExpiredRoom';
import { Toast } from './components/ui/Toast';

type Route =
  | { name: 'home' }
  | { name: 'create' }
  | { name: 'join'; code: string }
  | { name: 'room'; code: string };

function parseHash(hash: string): Route {
  const clean = hash.replace(/^#/, '').replace(/^\/+/, '');
  const parts = clean.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'home' };
  const [head, tail] = parts;
  switch (head.toLowerCase()) {
    case 'create':
      return { name: 'create' };
    case 'join':
      return { name: 'join', code: tail ? normalizeRoomCode(tail) : '' };
    case 'room':
      return { name: 'room', code: tail ? normalizeRoomCode(tail) : '' };
    default:
      return { name: 'home' };
  }
}

export default function App() {
  const [hash, setHash] = useState(() =>
    typeof window === 'undefined' ? '#/' : window.location.hash || '#/',
  );
  const route = useMemo(() => parseHash(hash), [hash]);
  const { state, actions } = useSession();
  const { preferences, update, toggleFlip } = usePreferences();

  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  useEffect(() => {
    if (
      (state.phase !== 'waiting' && state.phase !== 'playing') ||
      !state.roomCode
    ) {
      return;
    }
    const desired = `#/room/${state.roomCode}`;
    if (window.location.hash !== desired) {
      window.history.replaceState(null, '', desired);
      setHash(desired);
    }
  }, [hash, state.phase, state.roomCode]);

  useEffect(() => {
    if (state.phase !== 'waiting' && state.phase !== 'playing') return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [state.phase]);

  const navigate = (target: string) => {
    const next = target.startsWith('#') ? target : `#${target}`;
    if (window.location.hash !== next) {
      window.location.hash = next;
    }
    setHash(next);
  };

  const goHome = () => navigate('#/');
  const goCreate = () => navigate('#/create');
  const goJoin = () => navigate('#/join');

  const render = () => {
    if (state.phase === 'waiting') {
      return <WaitingRoom state={state} />;
    }
    if (state.phase === 'joining') {
      return (
        <JoinRoom
          initialCode={route.name === 'join' ? route.code : state.roomCode ?? ''}
          onBack={goHome}
        />
      );
    }
    if (state.phase === 'playing') {
      return (
        <GameView
          preferences={preferences}
          update={update}
          toggleFlip={toggleFlip}
        />
      );
    }
    if (state.phase === 'ended') {
      return <SessionEnded onHome={goHome} onCreate={goCreate} />;
    }
    if (state.phase === 'error') {
      return <ErrorPage onHome={goHome} onJoin={goJoin} />;
    }

    if (route.name === 'create') {
      return <CreateRoom onBack={goHome} />;
    }
    if (route.name === 'join') {
      return <JoinRoom initialCode={route.code} onBack={goHome} />;
    }
    if (route.name === 'room') {
      return (
        <ExpiredRoom
          code={route.code || undefined}
          onJoin={goJoin}
          onCreate={goCreate}
          onHome={goHome}
        />
      );
    }
    return <HomePage onCreate={goCreate} onJoin={goJoin} />;
  };

  return (
    <>
      {render()}
      <Toast notice={state.notice} onDismiss={actions.clearNotice} />
    </>
  );
}

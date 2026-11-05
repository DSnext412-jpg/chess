import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Link2,
  Play,
  ShieldCheck,
  Sparkles,
  Swords,
  Users,
  Zap,
} from 'lucide-react';
import { Logo } from './ui/Logo';
import { Button } from './ui/Button';
import { HeroBoard } from './home/HeroBoard';

interface HomePageProps {
  onCreate: () => void;
  onJoin: () => void;
}

const features = [
  {
    icon: Users,
    title: 'Play with friends',
    description: 'Share a private link. No lobbies, no strangers.',
  },
  {
    icon: ShieldCheck,
    title: 'No account required',
    description: 'Open the page and play. Nothing to sign up for.',
  },
  {
    icon: Clock,
    title: 'Temporary rooms',
    description: 'Rooms exist only while your session is live.',
  },
  {
    icon: Swords,
    title: 'Two ways to play',
    description: 'Regulation chess or relaxed free movement.',
  },
  {
    icon: Zap,
    title: 'Real-time P2P',
    description: 'Moves travel directly over WebRTC data channels.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create a room',
    description: 'Pick a name and movement rules. You take the white pieces.',
  },
  {
    number: '02',
    title: 'Share the invitation',
    description: 'Send the room code or invite link to your opponent.',
  },
  {
    number: '03',
    title: 'Friend joins',
    description: 'Their board opens from the opposite side, ready to play.',
  },
  {
    number: '04',
    title: 'Make your move',
    description: 'Every move syncs instantly. End the session when you are done.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

export function HomePage({ onCreate, onJoin }: HomePageProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-14%] h-[520px] w-[520px] rounded-full bg-gold-500/[0.07] blur-[120px]" />
        <div className="absolute right-[-12%] top-[18%] h-[460px] w-[460px] rounded-full bg-[#3a2a18]/40 blur-[120px]" />
        <div className="bg-fine-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_68%)]" />
      </div>

      <header className="relative z-30">
        <div className="container-page flex h-20 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-7 text-[12px] font-semibold text-ivory-200/55 md:flex">
            <a href="#features" className="transition hover:text-ivory-50">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-ivory-50">
              How it works
            </a>
            <a href="#modes" className="transition hover:text-ivory-50">
              Game modes
            </a>
          </nav>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onJoin}
              className="hidden text-[12px] font-semibold text-ivory-200/65 transition hover:text-ivory-50 sm:block"
            >
              Join a room
            </button>
            <Button size="sm" onClick={onCreate} icon={<Sparkles className="h-3.5 w-3.5" />}>
              Create room
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container-page relative pb-20 pt-10 sm:pt-16 lg:pb-28 lg:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
            <motion.div
              initial="hidden"
              animate="show"
              transition={{ staggerChildren: 0.09 }}
              className="relative z-10 max-w-[580px]"
            >
              <div className="text-[10px] text-ivory-200/35 mt-2">
                created by Dipak sonawane
              </div>
              <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="flex items-center gap-3">
                <span className="h-px w-8 bg-gold-400/50" />
                <span className="eyebrow">Private peer-to-peer chess</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.7 }}
                className="mt-5 font-display text-[clamp(3.35rem,7.4vw,5.7rem)] font-semibold leading-[0.9] tracking-[-0.015em] text-ivory-50"
              >
                Your Board.
                <br />
                Your Game.
                <br />
                <span className="text-gradient-gold italic">Your Move.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.7 }}
                className="mt-6 max-w-[470px] text-[15px] leading-7 text-ivory-200/55 sm:text-base"
              >
                Create a private chess room in seconds, share one link, and play
                a friend in real time. Moves travel directly between your
                browsers — then the room disappears.
              </motion.p>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.7 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Button
                  size="lg"
                  onClick={onCreate}
                  icon={<Play className="h-4 w-4 fill-current" />}
                  trailingIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Create a room
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onJoin}
                  icon={<Users className="h-4 w-4" />}
                >
                  Join with a code
                </Button>
              </motion.div>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.7 }}
                className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-ivory-200/[0.38]"
              >
                {['No sign-up', 'No downloads', 'Direct P2P connection'].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-gold-400/70" />
                      {item}
                    </span>
                  ),
                )}
              </motion.div>
            </motion.div>

            <div className="relative z-0">
              <HeroBoard />
            </div>
          </div>
        </section>

        <section id="features" className="container-page scroll-mt-24 pb-20 lg:pb-28">
          <div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Built for a quick game</p>
              <h2 className="mt-2 font-display text-4xl font-semibold text-ivory-50 sm:text-5xl">
                Everything you need. <span className="text-ivory-200/35">Nothing you don&apos;t.</span>
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-ivory-200/45">
              A focused chess room — not another dashboard. Fast to start, easy
              to share, gone when you are finished.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  className="card group relative overflow-hidden p-5 transition-colors duration-300 hover:border-gold-400/25 hover:bg-white/[0.045]"
                >
                  <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gold-400/[0.06] blur-2xl transition group-hover:bg-gold-400/[0.12]" />
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-gold-300">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-4 text-[13px] font-bold text-ivory-50">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-[12px] leading-5 text-ivory-200/45">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section
          id="how-it-works"
          className="relative scroll-mt-24 border-y border-white/[0.05] bg-black/20 py-20 lg:py-24"
        >
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Four steps, about a minute</p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-ivory-50 sm:text-5xl">
                From link to board in seconds.
              </h2>
              <p className="mt-4 text-sm leading-6 text-ivory-200/45">
                No room codes to remember, no server to wait for. One player
                hosts; the other joins the invitation.
              </p>
            </div>

            <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              <div className="pointer-events-none absolute left-[8%] right-[8%] top-7 hidden h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent lg:block" />
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="relative"
                >
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-400/20 bg-ink-850 font-display text-xl font-semibold text-gold-300 shadow-[0_12px_30px_-16px_rgba(217,179,106,0.5)]">
                    {step.number}
                  </div>
                  <h3 className="mt-5 text-sm font-bold text-ivory-50">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[240px] text-[12.5px] leading-6 text-ivory-200/45">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={onCreate} trailingIcon={<ArrowRight className="h-4 w-4" />}>
                Start a session
              </Button>
              <span className="text-[11px] text-ivory-200/30">
                White pieces are assigned to the host.
              </span>
            </div>
          </div>
        </section>

        <section id="modes" className="container-page scroll-mt-24 py-20 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Movement rules</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-ivory-50 sm:text-5xl">
              Regulation or relaxed.
            </h2>
            <p className="mt-4 text-sm leading-6 text-ivory-200/45">
              Choose the rules before the room opens. The host can request a
              change later — both players must agree.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <div className="card-strong relative overflow-hidden p-7 sm:p-9">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold-400/[0.06] blur-3xl" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="chip">
                    <ShieldCheck className="h-3 w-3 text-gold-300" />
                    Mode A
                  </span>
                  <h3 className="mt-4 font-display text-3xl font-semibold text-ivory-50">
                    Standard Chess
                  </h3>
                  <p className="mt-3 max-w-md text-[13px] leading-6 text-ivory-200/50">
                    Complete FIDE-style move validation: checks, castling, en
                    passant, promotion, stalemate, draws and checkmate.
                  </p>
                </div>
                <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-gold-400/15 bg-gold-400/[0.05] sm:flex">
                  <Swords className="h-7 w-7 text-gold-300/80" strokeWidth={1.4} />
                </div>
              </div>
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {[
                  'Legal moves only',
                  'Turn management',
                  'Check & checkmate alerts',
                  'Full draw detection',
                  'Castling & en passant',
                  'Pawn promotion picker',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-[12px] text-ivory-200/60"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0 text-gold-400/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-strong relative overflow-hidden p-7 sm:p-9">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/[0.045] blur-3xl" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="chip">
                    <Sparkles className="h-3 w-3 text-emerald-300/80" />
                    Mode B
                  </span>
                  <h3 className="mt-4 font-display text-3xl font-semibold text-ivory-50">
                    Free Movement
                  </h3>
                  <p className="mt-3 max-w-md text-[13px] leading-6 text-ivory-200/50">
                    A casual sandbox. Move any piece, in any direction, on any
                    turn. Occupied squares are replaced and the displaced piece
                    is captured.
                  </p>
                </div>
                <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] sm:flex">
                  <Zap className="h-7 w-7 text-emerald-300/70" strokeWidth={1.4} />
                </div>
              </div>
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {[
                  'Any piece, any square',
                  'No turn restrictions',
                  'Replace occupied squares',
                  'No check or checkmate',
                  'Captures still tracked',
                  'Perfect for testing ideas',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-[12px] text-ivory-200/60"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-300/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="container-page pb-24">
          <div className="relative overflow-hidden rounded-[28px] border border-gold-400/15 bg-gradient-to-br from-[#18120b] via-ink-850 to-[#0b0b0d] px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(217,179,106,0.18),transparent_60%)]" />
            <div className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-[70%] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" />
            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-400/25 bg-gold-400/10">
                <Sparkles className="h-5 w-5 text-gold-300" />
              </div>
              <h2 className="mt-5 font-display text-4xl font-semibold text-ivory-50 sm:text-5xl">
                Ready when you are.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ivory-200/45">
                Your room is created instantly. Invite one friend, play your
                game, then let the room vanish.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={onCreate}
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  Create your room
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={onJoin}
                  trailingIcon={<ChevronRight className="h-4 w-4" />}
                >
                  I have an invitation
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] bg-black/20">
        <div className="container-page flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Logo compact />
            <p className="max-w-xs text-[11px] leading-5 text-ivory-200/35">
              Temporary, peer-to-peer chess. PeerJS handles signaling only —
              moves never pass through a game server.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-ivory-200/35">
            <span className="inline-flex items-center gap-1.5">
              <Copy className="h-3 w-3" /> Copy & share room codes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Link2 className="h-3 w-3" /> Invite by link
            </span>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <img
              src="/src/pic1.jpg"
              alt="Dipak Sonawane"
              className="h-8 w-8 rounded-full object-cover"
            />
            <a
              href="https://www.instagram.com/ds_412_/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-ivory-200/35 hover:text-ivory-50 transition"
            >
              @ds_412_
            </a>
            <a
              href="https://www.linkedin.com/in/dipak-sonawane-511b5323a/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-ivory-200/35 hover:text-ivory-50 transition"
            >
              dipak-sonawane-511b5323a
            </a>
          </div>
          <div className="mt-4 sm:mt-0 text-center sm:text-right text-[10px] text-ivory-200/35">
            &copy; 2026 dipak sonawane
          </div>
        </div>
      </footer>
    </div>
  );
}

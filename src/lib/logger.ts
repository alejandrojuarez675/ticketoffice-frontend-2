type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const envLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';
const current = LEVELS[envLevel] ?? LEVELS.info;

function safeSerialize(meta?: unknown) {
  try {
    return meta == null ? undefined : JSON.stringify(meta);
  } catch {
    return undefined;
  }
}

export const logger = {
  debug: (msg: string, meta?: unknown) => {
    if (current <= LEVELS.debug) console.debug(`[debug] ${msg}`, safeSerialize(meta));
  },
  info: (msg: string, meta?: unknown) => {
    if (current <= LEVELS.info) console.info(`[info] ${msg}`, safeSerialize(meta));
  },
  warn: (msg: string, meta?: unknown) => {
    if (current <= LEVELS.warn) console.warn(`[warn] ${msg}`, safeSerialize(meta));
  },
  error: (msg: string, meta?: unknown) => {
    if (current <= LEVELS.error) console.error(`[error] ${msg}`, safeSerialize(meta));
  },
};

const attemptsStore = new Map();
const MAX_ATTEMPTS = 4;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const getKey = (username = '', ip = '') => `${username.toLowerCase()}::${ip}`;

export const loginAttemptsMiddleware = (req, res, next) => {
  const key = getKey(req.body.username || req.body.email || '', req.ip);
  const record = attemptsStore.get(key);

  if (record && record.lockedUntil && record.lockedUntil > Date.now()) {
    return res.status(429).json({
      message: `Too many failed attempts. Try again after ${new Date(record.lockedUntil).toLocaleTimeString()}.`
    });
  }

  req.loginAttemptKey = key;
  return next();
};

export const recordFailedAttempt = (key) => {
  if (!key) return;
  const record = attemptsStore.get(key) || { attempts: 0 };
  const attempts = record.attempts + 1;
  const payload = { attempts };

  if (attempts >= MAX_ATTEMPTS) {
    payload.lockedUntil = Date.now() + LOCK_DURATION_MS;
    payload.attempts = 0;
  }

  attemptsStore.set(key, payload);
};

export const resetLoginAttempts = (key) => {
  if (!key) return;
  attemptsStore.delete(key);
};


import { Request, Response, NextFunction } from 'express';

type Entry = { count: number; resetAt: number };
const buckets: Record<string, Entry> = {};

export const rateLimit = (max: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const entry = buckets[key] || { count: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count += 1;
    buckets[key] = entry;
    if (entry.count > max) {
      return res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
    }
    next();
  };
};

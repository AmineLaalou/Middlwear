// Émission / lecture du cookie de session (JWT httpOnly).
"use strict";

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me-please";
if (!process.env.JWT_SECRET) {
  console.warn("[middlwear] JWT_SECRET absent de .env — clé de développement utilisée, à ne jamais garder en production.");
}

const COOKIE_NAME = "mw_session";
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

function issueSession(res, user) {
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "30d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_MS,
    path: "/"
  });
}

function clearSession(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

function readUserId(req) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.sub;
  } catch {
    return null;
  }
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider,
    avatarUrl: user.avatar_url
  };
}

module.exports = { issueSession, clearSession, readUserId, publicUser };

// Store temporary authentication sessions for OTP verification
// Format: { email: { type: 'login'|'signup', data: {...}, expiresAt: timestamp } }

const authSessions = new Map();

// Clean up expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, session] of authSessions.entries()) {
    if (session.expiresAt < now) {
      authSessions.delete(email);
    }
  }
}, 10 * 60 * 1000);

export const storeAuthSession = (email, type, data) => {
  // Session expires in 10 minutes
  const expiresAt = Date.now() + 10 * 60 * 1000;
  authSessions.set(email, {
    type, // 'login' or 'signup'
    data,
    expiresAt,
  });
};

export const getAuthSession = (email) => {
  const session = authSessions.get(email);
  if (!session) {
    return null;
  }
  if (session.expiresAt < Date.now()) {
    authSessions.delete(email);
    return null;
  }
  return session;
};

export const removeAuthSession = (email) => {
  authSessions.delete(email);
};


export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface StoredAccount {
  email: string;
  password: string;
  user: AuthUser;
}

const USER_KEY = "memory-palace-auth-user";
const STATUS_KEY = "memory-palace-auth-status";
const ACCOUNTS_KEY = "memory-palace-auth-accounts";

function readAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function persistSession(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(STATUS_KEY, "true");
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(STATUS_KEY) !== "true") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function loginUser(
  email: string,
  password: string
): { success: true; user: AuthUser } | { success: false; error: string } {
  const normalized = email.trim().toLowerCase();
  const account = readAccounts().find((a) => a.email === normalized);
  if (!account) {
    return { success: false, error: "No account found with this email." };
  }
  if (account.password !== password) {
    return { success: false, error: "Incorrect password." };
  }
  persistSession(account.user);
  return { success: true, user: account.user };
}

export function createAccount(
  name: string,
  email: string,
  password: string
): { success: true; user: AuthUser } | { success: false; error: string } {
  const normalized = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: "Please enter your name." };
  }
  if (!normalized.includes("@")) {
    return { success: false, error: "Please enter a valid email." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const accounts = readAccounts();
  if (accounts.some((a) => a.email === normalized)) {
    return { success: false, error: "An account with this email already exists." };
  }

  const user: AuthUser = {
    id: `user-${Date.now()}`,
    name: trimmedName,
    email: normalized,
    createdAt: new Date().toISOString(),
  };

  accounts.push({ email: normalized, password, user });
  writeAccounts(accounts);
  persistSession(user);
  return { success: true, user };
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
  localStorage.setItem(STATUS_KEY, "false");
}

/** Client-side guard — returns true if authenticated. */
export function requireAuth(): boolean {
  return isAuthenticated();
}

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, signSession, verifySession, sessionCookieOptions } from "./session";

export const currentUser = cache(async () => {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, phone: true, role: true, locale: true },
  });
});

export async function requireUser(lang: string) {
  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);
  return user;
}

export async function requireAdmin(lang: string) {
  const user = await requireUser(lang);
  if (user.role !== "ADMIN") redirect(`/${lang}/account`);
  return user;
}

export async function startSession(userId: string, role: string) {
  const token = await signSession({ userId, role: role === "ADMIN" ? "ADMIN" : "CLIENT" });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

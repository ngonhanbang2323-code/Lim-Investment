"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { locales, hasLocale } from "@/lib/i18n-config";
import { listStocks } from "@/lib/market";
import { postCategories } from "@/lib/posts";

async function assertAdmin() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const num = (form: FormData, key: string) => Number(str(form, key).replace(/[.,\s]/g, ""));
const langOf = (form: FormData) => (hasLocale(str(form, "lang")) ? str(form, "lang") : "vi");

/* Articles */

export type PostState = { error?: "invalid" | "slugTaken"; saved?: boolean };

const postSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  category: z.enum(postCategories),
  publishedAt: z.coerce.date(),
});

export async function savePost(_prev: PostState, form: FormData): Promise<PostState> {
  const admin = await assertAdmin();
  const id = str(form, "id");
  const parsed = postSchema.safeParse({ slug: str(form, "slug"), category: str(form, "category"), publishedAt: str(form, "publishedAt") });
  const translations = locales
    .map((locale) => ({ locale, title: str(form, `title_${locale}`), excerpt: str(form, `excerpt_${locale}`), body: str(form, `body_${locale}`) }))
    .filter((t) => t.title && t.excerpt && t.body);
  if (!parsed.success || !translations.some((t) => t.locale === "vi")) return { error: "invalid" };

  const clash = await db.post.findUnique({ where: { slug: parsed.data.slug } });
  if (clash && clash.id !== id) return { error: "slugTaken" };

  const data = { ...parsed.data, published: form.get("published") === "on" };
  const post = id
    ? await db.post.update({ where: { id }, data })
    : await db.post.create({ data: { ...data, authorId: admin.id } });

  await db.$transaction([
    db.postTranslation.deleteMany({ where: { postId: post.id, locale: { notIn: translations.map((t) => t.locale) } } }),
    ...translations.map((t) =>
      db.postTranslation.upsert({
        where: { postId_locale: { postId: post.id, locale: t.locale } },
        create: { ...t, postId: post.id },
        update: { title: t.title, excerpt: t.excerpt, body: t.body },
      })
    ),
  ]);
  revalidatePath("/[lang]", "layout");
  if (!id) redirect(`/${langOf(form)}/admin/posts/${post.id}?saved=1`);
  return { saved: true };
}

export async function deletePost(form: FormData) {
  await assertAdmin();
  await db.post.delete({ where: { id: str(form, "id") } });
  revalidatePath("/[lang]", "layout");
  redirect(`/${langOf(form)}/admin/posts`);
}

/* Managed portfolios */

function revalidateClient(userId: string) {
  revalidatePath(`/[lang]/admin/clients/${userId}`, "page");
  revalidatePath("/[lang]/account", "layout");
}

export async function saveManagedAccount(form: FormData) {
  await assertAdmin();
  const userId = str(form, "userId");
  const data = {
    name: str(form, "name") || "Danh mục ủy thác",
    strategy: str(form, "strategy"),
    inceptionDate: new Date(str(form, "inceptionDate") || Date.now()),
    cash: num(form, "cash") || 0,
    note: str(form, "note") || null,
  };
  await db.managedAccount.upsert({ where: { userId }, create: { ...data, userId }, update: data });
  revalidateClient(userId);
}

async function accountFor(form: FormData) {
  const account = await db.managedAccount.findUnique({ where: { userId: str(form, "userId") } });
  if (!account) throw new Error("Managed account not found");
  return account;
}

export async function upsertManagedHolding(form: FormData) {
  await assertAdmin();
  const account = await accountFor(form);
  const symbol = str(form, "symbol").toUpperCase();
  const quantity = Math.round(num(form, "quantity"));
  const avgCost = num(form, "avgCost");
  if (!listStocks().some((s) => s.symbol === symbol) || !(quantity > 0) || !(avgCost > 0)) return;
  await db.managedHolding.upsert({
    where: { accountId_symbol: { accountId: account.id, symbol } },
    create: { accountId: account.id, symbol, quantity, avgCost },
    update: { quantity, avgCost },
  });
  revalidateClient(account.userId);
}

export async function deleteManagedHolding(form: FormData) {
  await assertAdmin();
  const account = await accountFor(form);
  await db.managedHolding.deleteMany({ where: { accountId: account.id, symbol: str(form, "symbol") } });
  revalidateClient(account.userId);
}

export async function upsertNav(form: FormData) {
  await assertAdmin();
  const account = await accountFor(form);
  const date = new Date(str(form, "date"));
  const nav = num(form, "nav");
  if (Number.isNaN(date.getTime()) || !(nav > 0)) return;
  await db.navPoint.upsert({
    where: { accountId_date: { accountId: account.id, date } },
    create: { accountId: account.id, date, nav },
    update: { nav },
  });
  revalidateClient(account.userId);
}

export async function deleteNav(form: FormData) {
  await assertAdmin();
  const account = await accountFor(form);
  await db.navPoint.deleteMany({ where: { accountId: account.id, id: str(form, "id") } });
  revalidateClient(account.userId);
}

export async function addReport(form: FormData) {
  await assertAdmin();
  const account = await accountFor(form);
  const url = str(form, "url");
  const title = str(form, "title");
  if (!title || !/^https?:\/\//.test(url)) return;
  await db.report.create({ data: { accountId: account.id, title, url, date: new Date(str(form, "date") || Date.now()) } });
  revalidateClient(account.userId);
}

export async function deleteReport(form: FormData) {
  await assertAdmin();
  const account = await accountFor(form);
  await db.report.deleteMany({ where: { accountId: account.id, id: str(form, "id") } });
  revalidateClient(account.userId);
}

/* Enquiries */

export async function toggleMessageHandled(form: FormData) {
  await assertAdmin();
  const id = str(form, "id");
  const msg = await db.contactMessage.findUnique({ where: { id } });
  if (!msg) return;
  await db.contactMessage.update({ where: { id }, data: { handled: !msg.handled } });
  revalidatePath("/[lang]/admin", "layout");
}

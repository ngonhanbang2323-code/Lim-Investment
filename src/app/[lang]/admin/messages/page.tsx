import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessageList } from "./message-list";

export default async function MessagesPage({ params }: PageProps<"/[lang]/admin/messages">) {
  const lang = await resolveLocale(params);
  await requireAdmin(lang);
  const t = await getDictionary(lang);
  const messages = await db.contactMessage.findMany({ orderBy: [{ handled: "asc" }, { createdAt: "desc" }], take: 200 });
  return <MessageList messages={messages} lang={lang} t={t} />;
}

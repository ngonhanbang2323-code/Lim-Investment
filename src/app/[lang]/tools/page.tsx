import { redirect } from "next/navigation";
import { resolveLocale } from "@/lib/i18n";

export default async function ToolsIndex({ params }: PageProps<"/[lang]/tools">) {
  redirect(`/${await resolveLocale(params)}/tools/screener`);
}

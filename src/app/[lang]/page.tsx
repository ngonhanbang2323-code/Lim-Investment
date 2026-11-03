import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { getIndices, getScreenerRows, getSessionDate, dataSource } from "@/lib/market";
import { listPosts } from "@/lib/posts";
import { fmtDate, fmtNumber, fmtPct, fmtSigned, signTone, toneClass } from "@/lib/format";
import { GrowthRings } from "@/components/growth-rings";
import { Sparkline } from "@/components/sparkline";
import { ButtonLink, Container, DataBadge, dataNote } from "@/components/ui";
import { ChevronRight } from "@/components/icons";
import { PostCard } from "@/components/post-card";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const lang = await resolveLocale(params);
  const t = await getDictionary(lang);
  const indices = getIndices();
  const vnindex = indices[0];
  const rows = getScreenerRows();
  const posts = await listPosts(lang, { limit: 3 });
  const p = (path: string) => `/${lang}${path}`;

  const toolStats = [
    {
      href: p("/tools/screener?vn30=1&sort=value"),
      title: t.nav.screener,
      hint: t.nav.screenerHint,
      count: rows.filter((r) => r.vn30).length,
      label: t.market.vn30Only,
    },
    {
      href: p("/tools/fundamental?preset=quality"),
      title: t.nav.fundamental,
      hint: t.nav.fundamentalHint,
      count: rows.filter((r) => r.roe >= 15 && r.debtToEquity <= 1).length,
      label: t.tools.presetList.quality,
    },
    {
      href: p("/tools/technical?preset=uptrend"),
      title: t.nav.technical,
      hint: t.nav.technicalHint,
      count: rows.filter((r) => r.price > r.ma50 && r.ma50 > r.ma200).length,
      label: t.tools.presetList.uptrend,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="on-dark relative overflow-hidden bg-forest-deep text-white">
        <Container className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div className="relative z-10">
            <h1 className="max-w-[16ch] font-display text-display text-white">{t.home.heroTitle}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{t.home.heroLead}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={p("/contact")} variant="onDark">
                {t.common.bookConsultation}
              </ButtonLink>
              <ButtonLink href={p("/market")} variant="ghostOnDark">
                {t.home.heroSecondary}
              </ButtonLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <GrowthRings label={t.home.ringsLabel} className="w-full text-lim-light" />
            <p className="absolute right-0 top-2 max-w-[11rem] text-right text-sm text-white/60">{t.home.ringsLabel}</p>
            <Link
              href={p("/market")}
              className="absolute bottom-2 left-0 w-64 rounded-lg border border-white/15 bg-forest-deep/90 p-4 backdrop-blur transition-colors hover:border-white/35 sm:bottom-6"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-white/75">{t.market.indices.VNINDEX}</span>
                <DataBadge source={dataSource} text={t.common} lang={lang} />
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="tabular text-3xl font-semibold">{fmtNumber(vnindex.value, lang, 2)}</span>
                <span className={`tabular text-sm font-medium ${toneClass[signTone(vnindex.change)]}`}>
                  {fmtSigned(vnindex.change, lang)} ({fmtPct(vnindex.changePct, lang)})
                </span>
              </div>
              <Sparkline values={vnindex.history.slice(-60).map((h) => h.value)} width={224} height={40} className={`mt-2 ${toneClass[signTone(vnindex.change)]}`} />
            </Link>
          </div>
        </Container>
      </section>

      {/* Market snapshot */}
      <section className="border-b border-line">
        <Container className="py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-h2 text-forest">{t.home.marketTitle}</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {t.common.session} {fmtDate(getSessionDate(), lang, { dateStyle: "full" })}
              </p>
            </div>
            <Link href={p("/market")} className="inline-flex min-h-11 items-center gap-1 font-medium text-link hover:underline">
              {t.market.board} <ChevronRight size={18} />
            </Link>
          </div>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {indices.map((idx) => {
              const tone = toneClass[signTone(idx.change)];
              return (
                <li key={idx.code} className="bg-surface p-5">
                  <p className="text-sm font-medium text-ink-muted">{t.market.indices[idx.code]}</p>
                  <p className="tabular mt-1 text-2xl font-semibold">{fmtNumber(idx.value, lang, 2)}</p>
                  <p className={`tabular text-sm font-medium ${tone}`}>
                    {fmtSigned(idx.change, lang)} ({fmtPct(idx.changePct, lang)})
                  </p>
                  <Sparkline values={idx.history.slice(-60).map((h) => h.value)} width={200} height={36} className={`mt-3 w-full ${tone}`} />
                  <p className="tabular mt-2 text-xs text-ink-muted">
                    <span className="sr-only">{t.market.breadth}: </span>
                    <span className="text-tone-up">▲ {idx.advancers}</span> · <span className="text-tone-down">▼ {idx.decliners}</span> ·{" "}
                    <span className="text-tone-ref">■ {idx.unchanged}</span>
                  </p>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 max-w-3xl text-xs text-ink-muted">{dataNote(dataSource, t.common)}</p>
        </Container>
      </section>

      {/* Philosophy */}
      <section>
        <Container className="py-20">
          <h2 className="font-display text-h2 text-forest">{t.home.philosophyTitle}</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {t.home.philosophy.map((item) => (
              <div key={item.title} className="border-t-2 border-lim pt-5">
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-ink-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Services */}
      <section className="bg-surface">
        <Container className="py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <h2 className="font-display text-h2 text-forest">{t.home.servicesTitle}</h2>
              <p className="mt-3 text-ink-muted">{t.home.servicesLead}</p>
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {t.services.items.map((s) => (
                <li key={s.key}>
                  <Link href={p(`/services#${s.key}`)} className="group grid gap-1 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
                    <div>
                      <h3 className="font-display text-2xl text-ink group-hover:text-forest">{s.title}</h3>
                      <p className="mt-1 max-w-xl text-ink-muted">{s.body}</p>
                    </div>
                    <ChevronRight size={22} className="hidden text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-forest sm:block" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Tools */}
      <section>
        <Container className="py-20">
          <h2 className="font-display text-h2 text-forest">{t.home.toolsTitle}</h2>
          <p className="mt-3 max-w-2xl text-ink-muted">{t.home.toolsLead}</p>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {toolStats.map((tool) => (
              <li key={tool.href}>
                <Link href={tool.href} className="flex h-full flex-col rounded-lg border border-line bg-surface p-6 transition-colors hover:border-forest">
                  <h3 className="text-lg font-semibold text-ink">{tool.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{tool.hint}</p>
                  <p className="mt-auto pt-8">
                    <span className="tabular font-display text-5xl text-forest">{tool.count}</span>
                    <span className="mt-1 block text-sm text-ink-muted">{tool.label}</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Insights */}
      {posts.length > 0 && (
        <section className="border-t border-line">
          <Container className="py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-h2 text-forest">{t.home.insightsTitle}</h2>
              <Link href={p("/insights")} className="inline-flex min-h-11 items-center gap-1 font-medium text-link hover:underline">
                {t.common.viewAll} <ChevronRight size={18} />
              </Link>
            </div>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} lang={lang} t={t} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section>
        <Container>
          <div className="relative overflow-hidden rounded-xl bg-forest-soft px-6 py-14 sm:px-12">
            <GrowthRings className="pointer-events-none absolute -right-24 -top-24 w-[420px] text-forest opacity-15" />
            <div className="relative max-w-xl">
              <h2 className="font-display text-h2 text-forest">{t.home.ctaTitle}</h2>
              <p className="mt-3 text-ink-muted">{t.home.ctaBody}</p>
              <ButtonLink href={p("/contact")} className="mt-7">
                {t.common.bookConsultation}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

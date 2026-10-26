"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SectionNav({ items, label }: { items: { href: string; label: string; exact?: boolean }[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-1 lg:flex-col">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="flex min-h-11 items-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-ink-muted hover:bg-forest-soft hover:text-ink aria-[current=page]:bg-forest aria-[current=page]:text-white"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

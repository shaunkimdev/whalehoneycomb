"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: HomeIcon },
  { href: "/investors", label: "고래", icon: WhaleIcon },
  { href: "/insider", label: "인사이더", icon: ExchangeIcon },
  { href: "/insights", label: "인사이트", icon: BulbIcon },
  { href: "/watchlist", label: "MY", icon: PersonIcon },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** 데스크톱(≥md) 상단 고정 네비 */
export function TopNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-card/90 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-[1080px] items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span aria-hidden>🐳</span>
          <span>
            웨일허니콤 <span className="text-primary">whalehoneycomb</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-xl px-4 py-2 text-[15px] font-semibold transition-colors ${
                  active ? "bg-fill text-ink" : "text-muted hover:bg-fill hover:text-ink-2"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

/** 모바일(<md) 하단 탭바 */
export function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                active ? "text-ink" : "text-muted"
              }`}
            >
              <Icon className="h-6 w-6" filled={active} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

type IconProps = { className?: string; filled?: boolean };

function HomeIcon({ className, filled }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

function WhaleIcon({ className, filled }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12c0 4.5 3.5 8 8.5 8S20 16.5 20 12c0-1 .9-2.2 2-2.5-1-.6-2.6-.4-3.5.3C17.5 6.5 14.5 4 11 4c.5.9.7 2 .5 3C9 7.5 5 9 3 12Z"
      />
    </svg>
  );
}

function ExchangeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4 3.5 7.5 7 11M3.5 7.5H17M17 13l3.5 3.5L17 20m3.5-3.5H7" />
    </svg>
  );
}

function BulbIcon({ className, filled }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6m-5 3h4m-2-18a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V18h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 3Z" />
    </svg>
  );
}

function PersonIcon({ className, filled }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M4.5 20.5c1.5-3.5 4.2-5 7.5-5s6 1.5 7.5 5" />
    </svg>
  );
}

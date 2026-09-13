"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarHeart, CookingPot, ShoppingBasket } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/planejar", label: "Planejar", icon: CalendarHeart },
  { href: "/cardapio", label: "Cardápio", icon: CookingPot },
  { href: "/compras", label: "Compras", icon: ShoppingBasket },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-cocoa/10 bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-terracotta text-white" : "text-cocoa-soft"
                  }`}
                >
                  <Icon size={20} strokeWidth={2.2} />
                </span>
                <span className={active ? "text-terracotta" : "text-cocoa-soft"}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

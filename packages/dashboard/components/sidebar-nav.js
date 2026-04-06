"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Transactions" },
    { href: "/generator", label: "QR Generator" },
    { href: "/analytics", label: "Analytics" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="nav">
      {links.map(({ href, label }) => {
        const isActive =
          pathname === href || (href !== "/" && pathname?.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={isActive ? "active" : ""}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

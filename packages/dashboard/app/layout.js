import "./globals.css";
import Link from "next/link";
import { MerchantSessionProvider } from "../components/merchant-session";
import { ShellHeader } from "../components/shell-header";
import { SidebarNav } from "../components/sidebar-nav";

export const metadata = {
  title: "Loy Payway Dashboard",
  description: "Merchant dashboard for Loy Payway middleware.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MerchantSessionProvider>
          <div className="shell">
            <aside className="sidebar">
              <div className="brand-card">
                <p className="eyebrow">Cambodia Bakong Middleware</p>
                <h1>Loy Payway</h1>
                <p className="muted">
                  A practical merchant ops layer for live QR generation, payment verification, and
                  webhook dispatch.
                </p>
              </div>
              <SidebarNav />
              <div className="sidebar-note">
                <span className="muted">Demo-first</span>
                <strong>Works locally before live Bakong credentials are ready.</strong>
              </div>
            </aside>
            <main className="main">
              <ShellHeader />
              {children}
            </main>
          </div>
        </MerchantSessionProvider>
      </body>
    </html>
  );
}

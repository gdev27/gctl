"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
  href: string;
  label: string;
};

const overviewLinks: NavLink[] = [
  { href: "/", label: "Dashboard" },
  { href: "/onboarding", label: "Readiness" }
];

const operationsLinks: NavLink[] = [
  { href: "/policies", label: "Policies" },
  { href: "/runs", label: "Runs" },
  { href: "/swarm", label: "Swarm Activity" }
];

const trustLinks: NavLink[] = [
  { href: "/evidence", label: "Evidence" },
  { href: "/settings", label: "Settings" }
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavGroup({ title, links, pathname, onClose }: { title: string; links: NavLink[]; pathname: string; onClose: () => void }) {
  return (
    <>
      <p className="nav-group-title">{title}</p>
      <ul>
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className={`nav-link ${active ? "nav-link-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span>{link.label}</span>
                {active ? <span className="pill neutral">Current</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function SideNav({ navOpen, onClose }: { navOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside id="primary-navigation" className="nav" data-open={navOpen} aria-label="Main navigation">
      <div className="nav-header">
        <strong>gctl Control Plane</strong>
        <p className="muted">Policy-safe operations with clear evidence trails.</p>
      </div>
      <NavGroup title="Overview" links={overviewLinks} pathname={pathname} onClose={onClose} />
      <NavGroup title="Operations" links={operationsLinks} pathname={pathname} onClose={onClose} />
      <NavGroup title="Trust and Config" links={trustLinks} pathname={pathname} onClose={onClose} />
    </aside>
  );
}

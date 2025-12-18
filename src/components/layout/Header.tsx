import Link from "next/link";
import { ReactNode } from "react";

interface HeaderProps {
  logo?: ReactNode;
  navigation?: Array<{ label: string; href: string }>;
  actions?: ReactNode;
}

export function Header({ logo, navigation, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            {logo}
            {navigation && navigation.length > 0 && (
              <nav className="hidden md:flex items-center gap-6">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </header>
  );
}

interface LogoProps {
  href?: string;
  children: ReactNode;
}

export function Logo({ href = "/", children }: LogoProps) {
  return (
    <Link
      href={href}
      className="text-2xl font-bold text-slate-900 hover:text-indigo-600 transition-colors"
    >
      {children}
    </Link>
  );
}

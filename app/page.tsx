import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navigation / Header */}
      <header className="border-b border-border bg-white px-6 py-4 md:px-12">
        <div className="mx-auto flex max-w-7-xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-primary text-white font-bold rounded">
              <Leaf size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-primary leading-tight">
                PRISPAT PRIME
              </span>
              <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold">
                National Distribution Network
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Public Records
            </Link>
            <Link href="#" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Compliance
            </Link>
            <Link href="#" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Support
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative mx-auto max-w-7-xl px-6 py-20 md:px-12 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-primary border border-border">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                System Operational
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
                The Standard in Agrochemical Distribution Management
              </h1>
              <p className="text-lg leading-8 text-secondary max-w-xl">
                Access the unified enterprise resource platform for secure agrochemical supply chain operations, inventory tracking, and nationwide distribution logistics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="btn-primary text-center">
                  Access Portal
                </Link>
                <Link href="#" className="inline-flex items-center justify-center rounded-sm border border-border px-6 py-3 text-sm font-semibold text-primary hover:bg-muted transition-colors">
                  System Overview
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="aspect-[4/3] overflow-hidden rounded-sm border border-border shadow-sm">
                <div className="h-full w-full bg-muted flex items-center justify-center border-l-[8px] border-primary">
                  <div className="text-center p-12">
                    <div className="mb-4 text-4xl opacity-20 font-bold uppercase tracking-widest text-[#22c55e]">PRISPAT PRIME</div>
                    <p className="text-sm text-secondary font-medium">Secure Enterprise Environment</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements for "Government" look */}
              <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-primary/5 -z-10"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t border-border py-12 px-6 md:px-12">
        <div className="mx-auto max-w-7-xl flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col gap-4">
            <div className="text-sm font-bold text-primary">PRISPAT PRIME</div>
            <p className="text-xs text-secondary max-w-xs">
              Authorized distribution partner for national agrochemical supply.
              Direct oversight and compliance monitoring systems integrated.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Portal</span>
              <Link href="/login" className="text-xs text-secondary hover:text-primary">Login</Link>
              <Link href="#" className="text-xs text-secondary hover:text-primary">Self-Service</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Security</span>
              <Link href="#" className="text-xs text-secondary hover:text-primary">Privacy Policy</Link>
              <Link href="#" className="text-xs text-secondary hover:text-primary">Terms of Use</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Network</span>
              <Link href="#" className="text-xs text-secondary hover:text-primary">Status</Link>
              <Link href="#" className="text-xs text-secondary hover:text-primary">API Documentation</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7-xl mt-12 pt-8 border-t border-border/50 text-center text-[10px] text-secondary">
          © {new Date().getFullYear()} Regional Agrochemical Distribution Hub. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

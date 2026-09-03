'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Terminal, Sparkles, LogOut, ArrowRight } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const isDemo = pathname === '/demo';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5 transition-transform">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-foreground">
                Infragen
              </span>
              <Badge variant="outline" className="hidden text-[10px] sm:inline-flex border-blue-500/30 text-blue-400 bg-blue-500/10">
                AI Agent
              </Badge>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
            <Link
              href="/#features"
              className="transition-colors hover:text-foreground hover:underline underline-offset-4"
            >
              Features
            </Link>
            <Link
              href="/#architecture"
              className="transition-colors hover:text-foreground hover:underline underline-offset-4"
            >
              Architecture
            </Link>
            <Link
              href="/#compare"
              className="transition-colors hover:text-foreground hover:underline underline-offset-4"
            >
              Comparison
            </Link>
            <Link
              href="/demo"
              className={`transition-colors hover:text-foreground ${
                isDemo ? 'text-primary font-semibold' : ''
              }`}
            >
              Live Demo
            </Link>
          </nav>
        </div>

        {/* Auth / Action CTA */}
        <div className="flex items-center gap-3">
          {/* Guest indicator banner when on Demo */}
          {isDemo && !session?.user && (
            <Badge variant="warning" className="hidden sm:inline-flex text-[11px]">
              Guest Review Mode
            </Badge>
          )}

          {isPending ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted/60" />
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 ring-1 ring-border">
                  {session.user.image && (
                    <AvatarImage src={session.user.image} alt={session.user.name || 'User'} />
                  )}
                  <AvatarFallback>
                    {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-xs font-medium text-muted-foreground sm:inline-block max-w-[120px] truncate">
                  {session.user.name || session.user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-xs text-muted-foreground hover:text-destructive gap-1 px-2.5"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  Sign In
                </Button>
              </Link>
              {!isDemo && (
                <Link href="/demo">
                  <Button variant="glow" size="sm" className="text-xs gap-1.5 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Try Demo</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

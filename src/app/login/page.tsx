'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signIn, signUp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GithubIcon } from '@/components/icons/GithubIcon';
import { Terminal, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (tab === 'signup') {
        const res = await signUp.email({
          email,
          password,
          name: name.trim() || email.split('@')[0] || 'User',
        });
        if (res.error) {
          setErrorMsg(res.error.message || 'Failed to create account. Please check your details.');
        } else {
          setSuccessMsg('Account created successfully! Redirecting to workspace...');
          setTimeout(() => {
            router.push('/demo');
          }, 1000);
        }
      } else {
        const res = await signIn.email({
          email,
          password,
        });
        if (res.error) {
          setErrorMsg(res.error.message || 'Invalid email or password.');
        } else {
          setSuccessMsg('Signed in successfully! Redirecting...');
          setTimeout(() => {
            router.push('/demo');
          }, 800);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please verify your connection.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGithubSignIn() {
    setErrorMsg(null);
    setIsSocialLoading(true);
    try {
      await signIn.social({
        provider: 'github',
        callbackURL: '/demo',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'GitHub sign-in error';
      setErrorMsg(msg);
      setIsSocialLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 bg-grid-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <Link href="/" className="group mb-3 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Infragen
            </span>
          </Link>
          <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs">
            Infrastructure Agent Workspace
          </Badge>
        </div>

        {/* Auth Card */}
        <Card className="border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4 text-center">
            {/* Tab switchers */}
            <div className="grid w-full grid-cols-2 rounded-lg bg-muted/60 p-1 border border-border/50 text-xs font-medium text-muted-foreground mb-3">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`rounded-md py-2 transition-all ${
                  tab === 'signin'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`rounded-md py-2 transition-all ${
                  tab === 'signup'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'hover:text-foreground'
                }`}
              >
                Create Account
              </button>
            </div>

            <CardTitle className="text-xl">
              {tab === 'signin' ? 'Welcome back' : 'Create your account'}
            </CardTitle>
            <CardDescription className="text-xs">
              {tab === 'signin'
                ? 'Sign in to access your saved generation history and configs.'
                : 'Get started with automated Docker and Kubernetes generation.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Social Auth */}
            <Button
              variant="outline"
              type="button"
              onClick={handleGithubSignIn}
              disabled={isSocialLoading || isLoading}
              className="w-full gap-2 border-border/80 hover:bg-neutral-900"
            >
              {isSocialLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GithubIcon className="h-4 w-4" />
              )}
              <span>Continue with GitHub</span>
            </Button>

            <div className="relative flex items-center justify-center">
              <Separator />
              <span className="absolute bg-card px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                Or with email
              </span>
            </div>

            {/* Error or Success notification */}
            {errorMsg && (
              <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Name (optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Email address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                variant="glow"
                disabled={isLoading || isSocialLoading}
                className="w-full mt-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : tab === 'signin' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-border/50 pt-4 text-center">
            {/* Guest mode escape hatch */}
            <div className="w-full rounded-lg bg-blue-500/5 border border-blue-500/20 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Want to try the generation pipeline right away without an account?
              </p>
              <Link href="/demo" className="w-full block">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 border-blue-500/30 hover:border-blue-500/60 hover:text-blue-400">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  <span>Launch Guest Demo Mode</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Overview
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

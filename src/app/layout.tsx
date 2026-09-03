import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Infragen — Production Docker & Kubernetes Engineered in Seconds',
  description:
    'AI agent producing validated multi-stage Dockerfiles and Kubernetes manifests with cost estimation and self-healing validation.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-blue-500/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}

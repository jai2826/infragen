'use client';

import * as React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/marketing/HeroSection';
import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { ArchitectureSection } from '@/components/marketing/ArchitectureSection';
import { ComparisonSection } from '@/components/marketing/ComparisonSection';
import { Footer } from '@/components/marketing/Footer';

export default function MarketingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-blue-500/30 selection:text-blue-200">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ArchitectureSection />
        <ComparisonSection />
      </main>
      <Footer />
    </div>
  );
}

import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import { ThemeProvider } from '../components/theme-provider';

export const metadata: Metadata = {
  title: 'Repository Intelligence & Code Review Platform',
  description: 'Enterprise-grade, graph-aware, multi-agent code analysis and repository intelligence platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

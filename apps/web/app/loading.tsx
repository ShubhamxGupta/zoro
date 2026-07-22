import React from 'react';
import { Skeleton } from '../components/ui/skeleton';

export default function Loading() {
  return (
    <div style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '1200px', margin: '0 auto' }}>
      <Skeleton height={32} width="30%" />
      <Skeleton height={18} width="60%" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
        <Skeleton height={120} borderRadius="var(--radius-lg)" />
        <Skeleton height={120} borderRadius="var(--radius-lg)" />
        <Skeleton height={120} borderRadius="var(--radius-lg)" />
      </div>
    </div>
  );
}

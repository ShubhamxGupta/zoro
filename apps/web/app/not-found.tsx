import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/empty-state';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        padding: 'var(--space-6)',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <EmptyState
          icon={<FileQuestion size={32} />}
          title="404 - Page Not Found"
          description="The requested page route or resource does not exist in the Repository Intelligence web shell."
          action={
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Return to UI Foundation</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}

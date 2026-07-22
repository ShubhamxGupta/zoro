import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { MetricChart } from '../charts/metric-chart';
import { ShieldCheck, ShieldAlert, FileCode, Network } from 'lucide-react';

export interface DashboardMetrics {
  qualityScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  openFindingsCount: number;
  graphNodesCount: number;
}

export interface MetricCardsProps {
  metrics?: DashboardMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics = {
    qualityScore: 92,
    riskLevel: 'LOW',
    openFindingsCount: 3,
    graphNodesCount: 1420,
  },
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
      {/* Quality Score Card */}
      <Card>
        <CardHeader style={{ marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Code Quality Index</span>
            <ShieldCheck size={18} style={{ color: 'var(--sev-info-text)' }} />
          </div>
        </CardHeader>
        <CardContent style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {metrics.qualityScore}
              <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sev-info-text)', marginTop: '2px' }}>+3.2% vs last PR</div>
          </div>
          <MetricChart data={[75, 80, 82, 88, 92]} color="var(--sev-info-text)" />
        </CardContent>
      </Card>

      {/* Risk Rating Card */}
      <Card>
        <CardHeader style={{ marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Overall Risk Rating</span>
            <ShieldAlert size={18} style={{ color: 'var(--sev-low-text)' }} />
          </div>
        </CardHeader>
        <CardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: 'var(--space-1)' }}>
              <Badge variant={metrics.riskLevel.toLowerCase() as 'low'}>{metrics.riskLevel} RISK</Badge>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>0 Critical Flaws</div>
          </div>
          <MetricChart data={[4, 3, 2, 2, 1]} color="var(--sev-low-text)" />
        </CardContent>
      </Card>

      {/* Open Findings Card */}
      <Card>
        <CardHeader style={{ marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Open Review Findings</span>
            <FileCode size={18} style={{ color: 'var(--sev-medium-text)' }} />
          </div>
        </CardHeader>
        <CardContent style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {metrics.openFindingsCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>1 High, 2 Medium</div>
          </div>
          <MetricChart data={[8, 6, 5, 4, 3]} color="var(--sev-medium-text)" />
        </CardContent>
      </Card>

      {/* Knowledge Graph Nodes Card */}
      <Card>
        <CardHeader style={{ marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Graph Subgraph Nodes</span>
            <Network size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
        </CardHeader>
        <CardContent style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {(metrics.graphNodesCount / 1000).toFixed(1)}k
            </div>
            <div style={{ fontSize: '11px', color: 'var(--accent-hover)', marginTop: '2px' }}>3,840 AST Edges</div>
          </div>
          <MetricChart data={[1000, 1150, 1300, 1420]} color="var(--accent-primary)" />
        </CardContent>
      </Card>
    </div>
  );
};

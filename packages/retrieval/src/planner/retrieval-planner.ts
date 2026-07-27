import type {
  ExpansionStrategy,
  QueryIntent,
  RetrievalPlan,
  RetrievalPlanner,
} from '@repo-intel/shared';

export class DefaultRetrievalPlanner implements RetrievalPlanner {
  public createPlan(intent: QueryIntent, maxTokensHint = 2000): RetrievalPlan {
    let vectorK = 10;
    let maxHops = 2;
    const strategies: ExpansionStrategy[] = ['neighbours'];
    let rankingPolicy = 'hybrid_standard';

    switch (intent.category) {
      case 'bug_investigation':
        vectorK = 15;
        maxHops = 3;
        strategies.push('call_graph', 'imports');
        rankingPolicy = 'graph_call_boost';
        break;

      case 'architecture':
        vectorK = 12;
        maxHops = 3;
        strategies.push('dependencies', 'imports', 'inheritance');
        rankingPolicy = 'module_hierarchy_boost';
        break;

      case 'dependency':
        vectorK = 10;
        maxHops = 2;
        strategies.push('dependencies', 'imports');
        rankingPolicy = 'import_graph_priority';
        break;

      case 'security':
        vectorK = 20;
        maxHops = 3;
        strategies.push('call_graph', 'dependencies');
        rankingPolicy = 'security_risk_boost';
        break;

      default:
        strategies.push('call_graph');
        break;
    }

    return {
      vectorK,
      maxHops,
      expansionStrategies: Array.from(new Set(strategies)),
      tokenBudget: maxTokensHint,
      rankingPolicy,
    };
  }
}

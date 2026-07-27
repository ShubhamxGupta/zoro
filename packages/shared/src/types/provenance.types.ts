/**
 * Graph Edge & Fact Provenance Metadata
 */

export interface GraphProvenance {
  extractor: string;
  language: string;
  query?: string;
  evidence: string;
  confidence: number; // Normalized 0.0 to 1.0
  timestamp: string;
}

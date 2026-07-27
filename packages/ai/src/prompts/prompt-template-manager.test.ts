import { describe, it, expect, beforeEach } from 'vitest';
import { PromptTemplateManager } from './prompt-template-manager.js';

describe('PromptTemplateManager', () => {
  let manager: PromptTemplateManager;

  beforeEach(() => {
    manager = new PromptTemplateManager();
  });

  it('renders prompt templates with variable substitution', () => {
    const rendered = manager.render('security', { context: 'Const user = null;' });
    expect(rendered).toContain('Const user = null;');
    expect(rendered).toContain('Security Engineer');
  });
});

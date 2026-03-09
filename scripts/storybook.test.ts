import { StorybookGenerator, ParserOutput } from './storybook';

function makeParserOutput(types: ParserOutput['types']): ParserOutput {
  return {
    types,
    metadata: {
      source: 'test',
      timestamp: '2024-01-01T00:00:00Z',
      rootType: types[0]?.name || 'ApiResponse',
    },
  };
}

describe('StorybookGenerator', () => {
  let storybook: StorybookGenerator;

  beforeEach(() => {
    storybook = new StorybookGenerator({ title: 'Test Docs' });
  });

  describe('HTML generation', () => {
    it('generates valid HTML with title', () => {
      const input = makeParserOutput([
        {
          name: 'User',
          kind: 'interface',
          fields: [
            { name: 'id', type: 'number', required: true },
            { name: 'name', type: 'string', required: true },
          ],
        },
      ]);

      const { html } = storybook.generate(input);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>Test Docs</title>');
      expect(html).toContain('User');
      expect(html).toContain('id');
      expect(html).toContain('name');
    });

    it('includes type badges', () => {
      const input = makeParserOutput([
        { name: 'User', kind: 'interface', fields: [] },
      ]);

      const { html } = storybook.generate(input);
      expect(html).toContain('class="tag interface"');
    });

    it('renders extends information', () => {
      const input = makeParserOutput([
        {
          name: 'Admin',
          kind: 'interface',
          extends: ['User'],
          fields: [],
        },
      ]);

      const { html } = storybook.generate(input);
      expect(html).toContain('Extends:');
      expect(html).toContain('<code>User</code>');
    });

    it('renders enum values', () => {
      const input = makeParserOutput([
        {
          name: 'Status',
          kind: 'enum',
          values: ['Active', 'Inactive'],
        },
      ]);

      const { html } = storybook.generate(input);
      expect(html).toContain('<code>Active</code>');
      expect(html).toContain('<code>Inactive</code>');
    });

    it('includes search functionality', () => {
      const input = makeParserOutput([
        { name: 'User', kind: 'interface', fields: [] },
      ]);

      const { html } = storybook.generate(input);
      expect(html).toContain('filterTypes');
      expect(html).toContain('storybook-search');
    });
  });

  describe('Markdown generation', () => {
    it('generates markdown with type tables', () => {
      const input = makeParserOutput([
        {
          name: 'User',
          kind: 'interface',
          fields: [
            { name: 'id', type: 'number', required: true },
            { name: 'email', type: 'string', required: false },
          ],
        },
      ]);

      const { markdown } = storybook.generate(input);
      expect(markdown).toContain('# Test Docs');
      expect(markdown).toContain('## interface `User`');
      expect(markdown).toContain('| `id` | `number` |');
      expect(markdown).toContain('| `email` | `string` |');
    });

    it('includes example JSON for interfaces', () => {
      const input = makeParserOutput([
        {
          name: 'User',
          kind: 'interface',
          fields: [
            { name: 'name', type: 'string', required: true },
          ],
        },
      ]);

      const { markdown } = storybook.generate(input);
      expect(markdown).toContain('**Example:**');
      expect(markdown).toContain('```json');
      expect(markdown).toContain('example string');
    });
  });

  describe('example value generation', () => {
    it('generates correct example for required fields in HTML', () => {
      const input = makeParserOutput([
        {
          name: 'Config',
          kind: 'interface',
          fields: [
            { name: 'enabled', type: 'boolean', required: true },
            { name: 'count', type: 'number', required: true },
            { name: 'label', type: 'string', required: true },
          ],
        },
      ]);

      const { html } = storybook.generate(input);
      expect(html).toContain('storybook-example');
    });

    it('skips examples when no required fields', () => {
      const input = makeParserOutput([
        {
          name: 'Config',
          kind: 'interface',
          fields: [
            { name: 'optional_field', type: 'string', required: false },
          ],
        },
      ]);

      const { html } = storybook.generate(input);
      expect(html).not.toContain('<div class="storybook-example">');

    });
  });

  describe('file output', () => {
    it('writes HTML and Markdown files', () => {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-test-'));

      const input = makeParserOutput([
        {
          name: 'User',
          kind: 'interface',
          fields: [{ name: 'id', type: 'number', required: true }],
        },
      ]);

      storybook.generate(input, tmpDir);

      expect(fs.existsSync(path.join(tmpDir, 'storybook.html'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'README.md'))).toBe(true);

      // Cleanup
      fs.rmSync(tmpDir, { recursive: true });
    });
  });
});

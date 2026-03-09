import { CodeGenerator, ParserOutput } from './generator';

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

describe('CodeGenerator', () => {
  let generator: CodeGenerator;

  beforeEach(() => {
    generator = new CodeGenerator();
  });

  describe('interface generation', () => {
    it('generates a simple interface', () => {
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

      const { code } = generator.generate(input);
      expect(code).toContain('export interface User');
      expect(code).toContain('id: number;');
      expect(code).toContain('name: string;');
    });

    it('marks optional fields with ?', () => {
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

      const { code } = generator.generate(input);
      expect(code).toContain('id: number;');
      expect(code).toContain('email?: string;');
    });

    it('generates extends clause', () => {
      const input = makeParserOutput([
        {
          name: 'Admin',
          kind: 'interface',
          extends: ['User'],
          fields: [
            { name: 'permissions', type: 'string[]', required: true },
          ],
        },
      ]);

      const { code } = generator.generate(input);
      expect(code).toContain('export interface Admin  extends User');
    });

    it('includes field descriptions as JSDoc', () => {
      const input = makeParserOutput([
        {
          name: 'User',
          kind: 'interface',
          fields: [
            { name: 'id', type: 'number', required: true, description: 'Unique identifier' },
          ],
        },
      ]);

      const { code } = generator.generate(input);
      expect(code).toContain('/** Unique identifier */');
    });
  });

  describe('type alias generation', () => {
    it('generates a type alias from values', () => {
      const input = makeParserOutput([
        {
          name: 'Status',
          kind: 'type',
          values: ['active', 'inactive', 'pending'],
        },
      ]);

      const { code } = generator.generate(input);
      expect(code).toContain('export type Status = active | inactive | pending;');
    });
  });

  describe('enum generation', () => {
    it('generates an enum', () => {
      const input = makeParserOutput([
        {
          name: 'Color',
          kind: 'enum',
          values: ['Red', 'Green', 'Blue'],
        },
      ]);

      const { code } = generator.generate(input);
      expect(code).toContain('export enum Color');
      expect(code).toContain('Red,');
      expect(code).toContain('Green,');
      expect(code).toContain('Blue');
    });
  });

  describe('array types', () => {
    it('resolves array types correctly', () => {
      const input = makeParserOutput([
        {
          name: 'Response',
          kind: 'interface',
          fields: [
            { name: 'items', type: 'string[]', required: true },
          ],
        },
      ]);

      const { code } = generator.generate(input);
      expect(code).toContain('items: string[];');
    });
  });

  describe('storybook types', () => {
    it('generates storybook documentation types', () => {
      const input = makeParserOutput([
        {
          name: 'User',
          kind: 'interface',
          fields: [
            { name: 'id', type: 'number', required: true },
          ],
        },
      ]);

      const { code } = generator.generate(input);
      expect(code).toContain('StorybookTypeDoc');
      expect(code).toContain('StorybookPropertyDoc');
      expect(code).toContain("'User'");
    });
  });

  describe('file output tracking', () => {
    it('returns list of generated file names', () => {
      const input = makeParserOutput([
        { name: 'User', kind: 'interface', fields: [] },
        { name: 'Status', kind: 'type', values: ['ok'] },
      ]);

      const { files } = generator.generate(input);
      expect(files).toContain('User.ts');
      expect(files).toContain('Status.ts');
      expect(files).toContain('storybook.types.ts');
    });
  });
});

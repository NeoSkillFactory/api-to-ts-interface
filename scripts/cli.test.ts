import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CLI } from './cli';

describe('CLI', () => {
  let tmpDir: string;
  let inputFile: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-test-'));
    inputFile = path.join(tmpDir, 'input.json');

    fs.writeFileSync(inputFile, JSON.stringify({
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      active: true,
      scores: [95, 87, 92],
      address: {
        city: 'New York',
        zip: '10001',
      },
    }), 'utf8');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe('parse command', () => {
    it('parses JSON input and writes output', () => {
      const outputFile = path.join(tmpDir, 'types.json');
      const cli = new CLI(['parse', `--input=${inputFile}`, `--output=${outputFile}`]);
      const exitCode = cli.run();

      expect(exitCode).toBe(0);
      expect(fs.existsSync(outputFile)).toBe(true);

      const output = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      expect(output.types).toBeDefined();
      expect(output.metadata).toBeDefined();
      expect(output.types.length).toBeGreaterThan(0);
    });

    it('returns error for missing --input', () => {
      const cli = new CLI(['parse']);
      const exitCode = cli.run();
      expect(exitCode).toBe(1);
    });

    it('returns error for invalid JSON input', () => {
      const badFile = path.join(tmpDir, 'bad.json');
      fs.writeFileSync(badFile, 'not json', 'utf8');
      const cli = new CLI(['parse', `--input=${badFile}`]);
      const exitCode = cli.run();
      expect(exitCode).toBe(1);
    });
  });

  describe('generate command', () => {
    it('generates TypeScript from parsed types', () => {
      // First parse
      const parsedFile = path.join(tmpDir, 'parsed.json');
      const parseCli = new CLI(['parse', `--input=${inputFile}`, `--output=${parsedFile}`]);
      parseCli.run();

      // Then generate
      const outDir = path.join(tmpDir, 'generated');
      const genCli = new CLI(['generate', `--input=${parsedFile}`, `--output=${outDir}`]);
      const exitCode = genCli.run();

      expect(exitCode).toBe(0);
      expect(fs.existsSync(path.join(outDir, 'generated-interfaces.ts'))).toBe(true);

      const code = fs.readFileSync(path.join(outDir, 'generated-interfaces.ts'), 'utf8');
      expect(code).toContain('export interface');
      expect(code).toContain('id');
      expect(code).toContain('name');
    });
  });

  describe('storybook command', () => {
    it('generates Storybook HTML from parsed types', () => {
      const parsedFile = path.join(tmpDir, 'parsed.json');
      const parseCli = new CLI(['parse', `--input=${inputFile}`, `--output=${parsedFile}`]);
      parseCli.run();

      const docsDir = path.join(tmpDir, 'docs');
      const sbCli = new CLI(['storybook', `--input=${parsedFile}`, `--output=${docsDir}`]);
      const exitCode = sbCli.run();

      expect(exitCode).toBe(0);
      expect(fs.existsSync(path.join(docsDir, 'storybook.html'))).toBe(true);
      expect(fs.existsSync(path.join(docsDir, 'README.md'))).toBe(true);
    });
  });

  describe('all command', () => {
    it('runs the full pipeline', () => {
      const outDir = path.join(tmpDir, 'full-output');
      const cli = new CLI(['all', `--input=${inputFile}`, `--outputDir=${outDir}`]);
      const exitCode = cli.run();

      expect(exitCode).toBe(0);
      expect(fs.existsSync(path.join(outDir, 'parsed-types.json'))).toBe(true);
      expect(fs.existsSync(path.join(outDir, 'interfaces'))).toBe(true);
      expect(fs.existsSync(path.join(outDir, 'docs'))).toBe(true);
    });
  });

  describe('help and version', () => {
    it('returns 0 for help', () => {
      const cli = new CLI(['help']);
      expect(cli.run()).toBe(0);
    });

    it('returns 0 for version', () => {
      const cli = new CLI(['version']);
      expect(cli.run()).toBe(0);
    });

    it('returns 1 for unknown command', () => {
      const cli = new CLI(['foobar']);
      expect(cli.run()).toBe(1);
    });
  });
});

import { APIParser } from './parser';

describe('APIParser', () => {
  let parser: APIParser;

  beforeEach(() => {
    parser = new APIParser();
  });

  describe('primitive types', () => {
    it('parses string fields', () => {
      const result = parser.parse({ name: 'Alice' });
      expect(result.types).toHaveLength(1);
      expect(result.types[0].fields).toEqual([
        { name: 'name', type: 'string', required: true },
      ]);
    });

    it('parses number fields', () => {
      const result = parser.parse({ age: 30, score: 3.14 });
      expect(result.types[0].fields).toEqual([
        { name: 'age', type: 'number', required: true },
        { name: 'score', type: 'number', required: true },
      ]);
    });

    it('parses boolean fields', () => {
      const result = parser.parse({ active: true });
      expect(result.types[0].fields![0].type).toBe('boolean');
    });

    it('parses null fields as optional any', () => {
      const result = parser.parse({ value: null, name: 'test' });
      const valueField = result.types[0].fields!.find(f => f.name === 'value');
      expect(valueField!.type).toBe('any');
      expect(valueField!.required).toBe(false);
    });
  });

  describe('ISO 8601 date detection', () => {
    it('detects ISO date strings as Date type', () => {
      const result = parser.parse({ created: '2024-01-15T10:30:00Z' });
      expect(result.types[0].fields![0].type).toBe('Date');
    });

    it('detects ISO date with offset', () => {
      const result = parser.parse({ created: '2024-01-15T10:30:00+05:30' });
      expect(result.types[0].fields![0].type).toBe('Date');
    });

    it('treats non-ISO strings as string', () => {
      const result = parser.parse({ name: 'not-a-date' });
      expect(result.types[0].fields![0].type).toBe('string');
    });
  });

  describe('arrays', () => {
    it('parses empty arrays as any[]', () => {
      const result = parser.parse({ items: [] });
      expect(result.types[0].fields![0].type).toBe('any[]');
    });

    it('parses arrays of primitives', () => {
      const result = parser.parse({ tags: ['a', 'b'] });
      expect(result.types[0].fields![0].type).toBe('string[]');
    });

    it('parses arrays of objects', () => {
      const result = parser.parse({
        users: [{ id: 1, name: 'Alice' }],
      });
      const rootType = result.types.find(t => t.name === 'ApiResponse');
      const usersField = rootType!.fields!.find(f => f.name === 'users');
      expect(usersField!.type).toBe('UsersItem[]');

      const itemType = result.types.find(t => t.name === 'UsersItem');
      expect(itemType).toBeDefined();
      expect(itemType!.fields).toHaveLength(2);
    });
  });

  describe('nested objects', () => {
    it('creates separate interfaces for nested objects', () => {
      const result = parser.parse({
        user: {
          name: 'Alice',
          address: {
            city: 'NYC',
            zip: '10001',
          },
        },
      });
      expect(result.types.length).toBeGreaterThanOrEqual(3);
      const addressType = result.types.find(t => t.name === 'Address');
      expect(addressType).toBeDefined();
      expect(addressType!.fields).toEqual([
        { name: 'city', type: 'string', required: true },
        { name: 'zip', type: 'string', required: true },
      ]);
    });
  });

  describe('metadata', () => {
    it('includes metadata with rootType', () => {
      const result = parser.parse({ id: 1 });
      expect(result.metadata.rootType).toBe('ApiResponse');
      expect(result.metadata.source).toBe('parser');
      expect(result.metadata.timestamp).toBeTruthy();
    });

    it('accepts custom root name', () => {
      const result = parser.parse({ id: 1 }, 'UserResponse');
      expect(result.metadata.rootType).toBe('UserResponse');
      expect(result.types[0].name).toBe('UserResponse');
    });
  });

  describe('reusability', () => {
    it('can be called multiple times without accumulating types', () => {
      const result1 = parser.parse({ a: 1 });
      const result2 = parser.parse({ b: 'hello' });
      expect(result1.types).toHaveLength(1);
      expect(result2.types).toHaveLength(1);
      expect(result2.types[0].fields![0].name).toBe('b');
    });
  });

  describe('PascalCase conversion', () => {
    it('converts snake_case to PascalCase', () => {
      const result = parser.parse({
        user_profile: { first_name: 'Alice' },
      });
      const profileType = result.types.find(t => t.name === 'UserProfile');
      expect(profileType).toBeDefined();
    });

    it('converts kebab-case to PascalCase', () => {
      const result = parser.parse({
        'user-data': { name: 'test' },
      });
      const dataType = result.types.find(t => t.name === 'UserData');
      expect(dataType).toBeDefined();
    });
  });
});

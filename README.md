# api-to-ts-interface

![Audit](https://img.shields.io/badge/audit%3A%20PASS-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![OpenClaw](https://img.shields.io/badge/OpenClaw-skill-orange)

> Automatically generates TypeScript interfaces from REST API responses with Storybook-style documentation UI.

## Features

1. **Type Extraction**: Recursively parses API responses to extract object structures, array types, unions, primitives, and nested hierarchies
2. **Code Generation**: Produces well-formatted, linted TypeScript interfaces with proper typing, readonly modifiers, and index signatures where appropriate
3. **Storybook UI**: Generates interactive documentation that visualizes type structures, shows examples, and provides searchable exploration
4. **CLI Interface**: Command-line tool for direct usage, scripting, and agent integration
5. **Error-Free Output**: Validates generated code syntax and ensures TypeScript compiler compatibility
6. **Template System**: Customizable templates for interfaces and Storybook components
7. **Multi-Endpoint Support**: Process multiple API responses and merge or separate interfaces as needed

## Requirements

- `typescript`: TypeScript compiler API for validation
- `commander` or `yargs`: CLI framework
- `prettier`: Code formatting
- `json-schema-to-typescript` (optional): For schema-based generation
- `react` & `@storybook/react`: Storybook UI components
- `jsonschema` or `fast-xml-parser`: XML support

## Configuration

The skill respects configuration files:
- `.apitotsrc.json`: Project-level settings (output paths, template variants)
- `types.json` in project root: Custom type overrides

Common options:
```json
{
  "output": "src/types/",
  "mergeInterfaces": true,
  "storybook": true,
  "format": "prettier",
  "template": "default"
}
```

## GitHub

Source code: [github.com/NeoSkillFactory/api-to-ts-interface](https://github.com/NeoSkillFactory/api-to-ts-interface)

## License

MIT © NeoSkillFactory
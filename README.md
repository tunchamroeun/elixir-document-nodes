# Elixir Document Nodes Plugin

A [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) plugin that generates Elixir modules with embedded GraphQL document nodes. This plugin helps you integrate GraphQL operations seamlessly into your Elixir codebase.

> This plugin is a fork of [GraphQL Code Generator](https://github.com/dotansimha/graphql-code-generator) with added support for Elixir document nodes generation. The original project is maintained by [The Guild](https://the-guild.dev/) and has support for multiple languages and frameworks.

## Installation

You can install the plugin using npm, yarn, or pnpm:

```bash
# npm
npm install --save-dev elixir-document-nodes

# yarn
yarn add -D elixir-document-nodes

# pnpm
pnpm add -D elixir-document-nodes
```

## Requirements

- Node.js >= 16
- GraphQL >= 14.0.0
- A running GraphQL server (for schema introspection)
- Elixir/Mix (for formatting generated files)

## Usage

### Basic Setup

Create a `codegen.ts` configuration file in your project root:

```typescript
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "schema.graphql",
  documents: "graphql/**/*.graphql",
  generates: {
    "./lib/generated/graphql.ex": {
      plugins: ["elixir-document-nodes"],
    },
  },
};

export default config;
```

### Advanced Configuration

Here's a more comprehensive example with all available options:

```typescript
import type { CodegenConfig } from "@graphql-codegen/cli";
import { execSync } from "child_process";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:4000/graphql", // Your GraphQL schema endpoint
  documents: "graphql/**/*.graphql", // Path to your GraphQL operations
  generates: {
    // Generate schema for reference
    "./schema.graphql": {
      plugins: ["schema-ast"],
    },
    // Generate Elixir modules
    "./lib/generated/graphql.ex": {
      plugins: ["elixir-document-nodes"],
      config: {
        // Convert GraphQL names to snake_case (Elixir convention)
        namingConvention: "change-case-all#snakeCase",
        // Your target Elixir module name
        moduleName: "MyApp.GraphQL.Documents",
        // Add more configuration options here
      },
      // Format the generated Elixir code using mix format
      hooks: {
        afterOneFileWrite: (filePath) => {
          try {
            execSync(`mix format ${filePath}`);
            console.log(`✨ Formatted ${filePath}`);
          } catch (error) {
            console.error(`Error formatting file: ${error}`);
          }
        },
      },
    },
  },
};

export default config;
```

## Configuration Options

| Option             | Type        | Default                       | Description                                     |
| ------------------ | ----------- | ----------------------------- | ----------------------------------------------- |
| `moduleName`       | `string`    | `"GraphQL.Documents"`         | The name of the generated Elixir module         |
| `namingConvention` | `string`    | `"change-case-all#snakeCase"` | The naming convention for generated identifiers |
| `scalars`          | `ScalarMap` | `{}`                          | Custom scalar type mappings                     |

## Example Output

For a GraphQL query like:

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}
```

The plugin generates an Elixir module like:

```elixir
defmodule MyApp.GraphQL.Documents do
  @moduledoc """
  Generated GraphQL document nodes.
  """

  def get_user do
    """
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
      }
    }
    """
  end
end
```

## Running Code Generation

```bash
# Using npx
npx graphql-codegen

# Or if you have it in your package.json scripts
npm run codegen
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you find a bug or have a feature request, please create an issue in the [GitHub repository](https://github.com/tunchamroeun/elixir-document-nodes).

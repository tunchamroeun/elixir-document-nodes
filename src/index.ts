import {
  oldVisit,
  PluginFunction,
  PluginValidateFn,
  Types,
} from "@graphql-codegen/plugin-helpers";
import {
  LoadedFragment,
  NamingConvention,
  RawClientSideBasePluginConfig,
} from "@graphql-codegen/visitor-plugin-common";
import {
  concatAST,
  DocumentNode,
  FragmentDefinitionNode,
  GraphQLSchema,
  Kind,
} from "graphql";
import { ElixirDocumentNodesVisitor } from "./visitor.js";

/**
 * @description This plugin generates Elixir source `.ex` file from GraphQL files `.graphql`.
 */
export interface ElixirDocumentNodesRawPluginConfig
  extends RawClientSideBasePluginConfig {
  /**
   * @description The name of the Elixir module to be generated
   * @default "Generated.GraphQL"
   */
  moduleName?: string;
  /**
   * @default change-case-all#pascalCase
   * @description Allow you to override the naming convention of the output.
   * You can either override all namings, or specify an object with specific custom naming convention per output.
   * The format of the converter must be a valid `module#method`.
   * Allowed values for specific output are: `typeNames`, `enumValues`.
   * You can also use "keep" to keep all GraphQL names as-is.
   * Additionally, you can set `transformUnderscore` to `true` if you want to override the default behavior,
   * which is to preserve underscores.
   *
   * Available case functions in `change-case-all` are `camelCase`, `capitalCase`, `constantCase`, `dotCase`, `headerCase`, `noCase`, `paramCase`, `pascalCase`, `pathCase`, `sentenceCase`, `snakeCase`, `lowerCase`, `localeLowerCase`, `lowerCaseFirst`, `spongeCase`, `titleCase`, `upperCase`, `localeUpperCase` and `upperCaseFirst`
   * [See more](https://github.com/btxtiger/change-case-all)
   *
   * @exampleMarkdown
   * ## Override All Names
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          namingConvention: 'change-case-all#lowerCase',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Upper-case enum values
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          namingConvention: {
   *            typeNames: 'change-case-all#pascalCase',
   *            enumValues: 'change-case-all#upperCase',
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Keep names as is
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *         namingConvention: 'keep',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Remove Underscores
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          namingConvention: {
   *            typeNames: 'change-case-all#pascalCase',
   *            transformUnderscore: true
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  namingConvention?: NamingConvention;
  /**
   * @default ""
   * @description Adds prefix to the name
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'src/api/user-service/queries.ts': {
   *        plugins: ['typescript-document-nodes'],
   *        config: {
   *          namePrefix: 'gql',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  namePrefix?: string;
  /**
   * @default ""
   * @description Adds suffix to the name
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'src/api/user-service/queries.ts': {
   *        plugins: ['typescript-document-nodes'],
   *        config: {
   *          nameSuffix: 'Query'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  nameSuffix?: string;
  /**
   * @default ""
   * @description Adds prefix to the fragment variable
   */
  fragmentPrefix?: string;
  /**
   * @default ""
   * @description Adds suffix to the fragment variable
   */
  fragmentSuffix?: string;
}

export const plugin: PluginFunction<ElixirDocumentNodesRawPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: ElixirDocumentNodesRawPluginConfig
) => {
  const allAst = concatAST(
    documents
      .map((v) => v.document)
      .filter((doc): doc is DocumentNode => doc !== undefined)
  );

  const allFragments: LoadedFragment[] = [
    ...(
      allAst.definitions.filter(
        (d) => d.kind === Kind.FRAGMENT_DEFINITION
      ) as FragmentDefinitionNode[]
    ).map((fragmentDef) => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false,
    })),
    ...(config.externalFragments || []),
  ];

  const visitor = new ElixirDocumentNodesVisitor(
    schema,
    allFragments,
    config,
    documents
  );
  const visitorResult = oldVisit(allAst, { leave: visitor as any });

  const content = [
    visitor.fragments,
    ...visitorResult.definitions.filter((t: any) => typeof t === "string"),
  ].join("\n");
  const elixirModule = `defmodule ${
    config.moduleName ?? "Generated.GraphQL"
  } do\n  @doc "Generated GraphQL queries"
  ${content}
  \nend`;
  return {
    content: elixirModule,
  };
};

export const validate: PluginValidateFn<any> = async (
  _schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  _config: any,
  outputFile: string
) => {
  if (!outputFile.endsWith(".ex")) {
    throw new Error(
      `Plugin "elixir-document-nodes" requires extension to be ".ex"!`
    );
  }
};

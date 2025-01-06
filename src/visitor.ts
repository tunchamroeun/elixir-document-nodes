import { Types } from "@graphql-codegen/plugin-helpers";
import {
  ClientSideBasePluginConfig,
  getConfigValue,
  LoadedFragment,
  NamingConvention,
} from "@graphql-codegen/visitor-plugin-common";
import autoBind from "auto-bind";
import { GraphQLSchema } from "graphql";
import { ElixirDocumentNodesRawPluginConfig } from "./index.js";
import { ClientSideBaseVisitor } from "./client-side-base-visitor";

export interface ElixirDocumentNodesPluginConfig
  extends ClientSideBasePluginConfig {
  namingConvention: NamingConvention;
  transformUnderscore: boolean;
}

export class ElixirDocumentNodesVisitor extends ClientSideBaseVisitor<
  ElixirDocumentNodesRawPluginConfig,
  ElixirDocumentNodesPluginConfig
> {
  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: ElixirDocumentNodesRawPluginConfig,
    documents: Types.DocumentFile[]
  ) {
    const additionalConfig = {
      documentVariablePrefix: getConfigValue(rawConfig.namePrefix, ""),
      documentVariableSuffix: getConfigValue(rawConfig.nameSuffix, ""),
      fragmentVariablePrefix: getConfigValue(rawConfig.fragmentPrefix, ""),
      fragmentVariableSuffix: getConfigValue(rawConfig.fragmentSuffix, ""),
    };
    super(schema, fragments, rawConfig, additionalConfig, documents);
    autoBind(this);
  }
}

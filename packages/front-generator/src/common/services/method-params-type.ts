import {RestParam, RestService, RestServiceMethod} from "../model/cuba-model";
import * as ts from "typescript";
import {TypeAliasDeclaration, TypeElement, TypeNode} from "typescript";
import {exportModifier, ModelContext, param} from "../model/model-utils";
import {entityImportInfo, enumImportInfo, ImportInfo} from "../import-utils";
import {ENTITIES_DIR} from "../common";

/**
 * In model could be methods with same name, but distinct parameters set,
 * we need to resolve this by using parameters type union.
 */
export type MethodWithOverloads = {
  serviceName: string
  methodName: string
  methods: RestServiceMethod[]
}

export type ParamTypeInfo = { typeNode: TypeNode, importInfo?: ImportInfo }

export function collectMethods(services: RestService[]): MethodWithOverloads[] {
  const methodWithOverloadsList: MethodWithOverloads[] = [];
  services.forEach(s => {
    s.methods.forEach(m => {
      const mwo = methodWithOverloadsList.find(value => value.serviceName == s.name && value.methodName == m.name);
      if (mwo) {
        //method with such name already exist - m is overload, add to methods
        mwo.methods.push(m);
      } else {
        //no methods with such name - create new entry
        methodWithOverloadsList.push({serviceName: s.name, methodName: m.name, methods: [m]});
      }
    })
  });
  return methodWithOverloadsList;
}

export function createMethodParamsType(overloadMethods: RestServiceMethod[], namePrefix: string, ctx: ModelContext)
  : {paramTypeNode: TypeAliasDeclaration, importInfos: ImportInfo[]} {

  const typeNodes: TypeNode[] = [];
  const importInfos: ImportInfo[] = [];

  overloadMethods.forEach(method => {
    const members: TypeElement[] = [];

    method.params.forEach(p => {
        const {typeNode, importInfo} = parseParamType(p, ctx);
        if (importInfo) importInfos.push(importInfo);

        members.push(ts.createPropertySignature(
          undefined,
          p.name,
          undefined,
          typeNode,
          undefined));
      }
    );

    typeNodes.push(ts.createTypeLiteralNode(members));
  });

  const paramTypeNode = ts.createTypeAliasDeclaration(
    undefined,
    [exportModifier()],
    methodParamsTypeName(overloadMethods[0].name, namePrefix),
    undefined,
    ts.createUnionTypeNode(typeNodes));

  return {paramTypeNode, importInfos};

}

export function createServiceCallParams(methodName: string, paramNamePrefix: string) {
  return [param('params', methodParamsTypeName(methodName, paramNamePrefix))];
}

function methodParamsTypeName(methodName: string, namePrefix: string) {
  return `${namePrefix}_${methodName}_params`;
}

export function parseParamType(param: RestParam, ctx: ModelContext)
  : ParamTypeInfo {

  const typeEnum = ctx.enumsMap.get(param.type);
  if (typeEnum) {
    return {
      typeNode: ts.createTypeReferenceNode(typeEnum.name.text, undefined),
      importInfo: enumImportInfo(typeEnum)
    }
  }

  const typeEntity = ctx.entitiesMap.get(param.type);
  if (typeEntity) {
    return {
      typeNode: ts.createTypeReferenceNode(typeEntity.entity.className, undefined),
      importInfo: entityImportInfo(typeEntity, ENTITIES_DIR)
    }
  }

  let typeNode;
  switch (param.type) {
    case 'java.lang.Boolean':
      typeNode = ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
      break;
    case 'java.lang.Integer':
      typeNode = ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
      break;
    case 'java.util.UUID':
    case 'java.lang.String':
      typeNode = ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
      break;
    default:
      typeNode = ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
  }

  return {typeNode, importInfo: undefined};
}
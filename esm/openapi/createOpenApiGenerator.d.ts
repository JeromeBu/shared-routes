import { OpenAPIV3 as OpenAPI } from "openapi-types";
import { z } from "zod";
import { PathParameters, UnknownSharedRoute } from "../index.mjs";
type OmitFromExisting<O, K extends keyof O> = Omit<O, K>;
type Examples<T> = {
    [media: string]: OpenAPI.ExampleObject & {
        value?: T;
    };
};
type WithExampleOrExamples<T> = {
    example?: T;
    examples?: never;
} | {
    example?: never;
    examples?: Examples<T>;
};
type OpenApiBody<T> = Pick<OpenAPI.BaseSchemaObject, "title" | "description" | "example"> & {
    example?: T;
};
type ExtraDocParameter<T> = Partial<OmitFromExisting<OpenAPI.ParameterBaseObject, "example" | "examples" | "schema" | "required" | "content">> & WithExampleOrExamples<T>;
type CreateOpenApiGenerator = <SharedRoutesByTag extends {
    [T: string]: Record<string, UnknownSharedRoute>;
}>(sharedRoutesByTag: SharedRoutesByTag, openApiRootDoc: Omit<OpenAPI.Document, "paths">) => (extraDataByRoute: Partial<{
    [Tag in keyof SharedRoutesByTag]: {
        [R in keyof SharedRoutesByTag[Tag]]: Omit<OpenAPI.PathItemObject, OpenAPI.HttpMethods> & {
            extraDocs: {
                urlParams?: PathParameters<SharedRoutesByTag[Tag][R]["url"]> extends Record<string, never> ? never : Record<keyof PathParameters<SharedRoutesByTag[Tag][R]["url"]>, ExtraDocParameter<string>>;
                body?: z.infer<SharedRoutesByTag[Tag][R]["requestBodySchema"]> extends void ? never : OpenApiBody<z.infer<SharedRoutesByTag[Tag][R]["requestBodySchema"]>>;
                queryParams?: z.infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]> extends void ? never : {
                    [K in keyof z.infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]>]: ExtraDocParameter<z.infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]>[K]>;
                };
                headerParams?: z.infer<SharedRoutesByTag[Tag][R]["headersSchema"]> extends void ? never : Partial<Record<keyof z.infer<SharedRoutesByTag[Tag][R]["headersSchema"]>, Partial<OpenAPI.ParameterObject>>>;
                responses: {
                    [S in keyof SharedRoutesByTag[Tag][R]["responses"]]: OpenAPI.ResponseObject & WithExampleOrExamples<z.infer<SharedRoutesByTag[Tag][R]["responses"][S]>>;
                };
            };
        };
    };
}>) => OpenAPI.Document;
export declare const createOpenApiGenerator: CreateOpenApiGenerator;
export {};

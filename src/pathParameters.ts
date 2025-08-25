type Http = "http://" | "https://";
type AbsoluteUrl = `${Http}${string}`;
type RelativeUrl = `/${string}`;
export type Url = AbsoluteUrl | RelativeUrl;

// mostly from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/ef87ee53bc501c0f0e79797add156fd8fa904ede/types/express-serve-static-core/index.d.ts#L98-L121

interface ParamsDictionary {
  [key: string]: string;
}

type RemoveDomain<S extends string> = S extends RelativeUrl
  ? S
  : S extends `${Http}${string}${"/"}${infer P}`
    ? `/${P}`
    : "/";

// biome-ignore format: better readability without formatting
type RemoveTail<S extends string, Tail extends string> = S extends `${infer P}${Tail}` ? P : S;

type GetRouteParameter<S extends string> = RemoveTail<
  RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
  `.${string}`
>;

export type PathParameters<Route extends string> = string extends Route
  ? ParamsDictionary
  : RemoveDomain<Route> extends `${string}:${infer Rest}`
    ? (GetRouteParameter<Rest> extends never
        ? ParamsDictionary
        : GetRouteParameter<Rest> extends `${infer ParamName}?`
          ? { [P in ParamName]?: string }
          : { [P in GetRouteParameter<Rest>]: string }) &
        (Rest extends `${GetRouteParameter<Rest>}${infer Next}`
          ? PathParameters<Next>
          : unknown)
    : {};

export type ReplaceParamsInUrl = <U extends Url>(
  path: U,
  params: PathParameters<U>,
) => Url;

export const replaceParamsInUrl: ReplaceParamsInUrl = (
  url,
  params = {} as PathParameters<typeof url>,
): Url => {
  const paramNames = keys(params);
  if (paramNames.length === 0) return url;
  return paramNames.reduce(
    (acc, paramName) => acc.replace(`:${paramName.toString()}`, params[paramName]),
    url as any,
  );
};

export const keys = <Obj extends Record<string, unknown>>(obj: Obj): (keyof Obj)[] =>
  Object.keys(obj) as (keyof Obj)[];

type Http = "http://" | "https://";
type AbsoluteUrl = `${Http}${string}`;
type RelativeUrl = `/${string}`;
export type Url = AbsoluteUrl | RelativeUrl;
interface ParamsDictionary {
    [key: string]: string;
}
type RemoveDomain<S extends string> = S extends RelativeUrl ? S : S extends `${Http}${string}${"/"}${infer P}` ? `/${P}` : "/";
type RemoveTail<S extends string, Tail extends string> = S extends `${infer P}${Tail}` ? P : S;
type GetRouteParameter<S extends string> = RemoveTail<RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>, `.${string}`>;
export type PathParameters<Route extends string> = string extends Route ? ParamsDictionary : RemoveDomain<Route> extends `${string}:${infer Rest}` ? (GetRouteParameter<Rest> extends never ? ParamsDictionary : GetRouteParameter<Rest> extends `${infer ParamName}?` ? {
    [P in ParamName]?: string;
} : {
    [P in GetRouteParameter<Rest>]: string;
}) & (Rest extends `${GetRouteParameter<Rest>}${infer Next}` ? PathParameters<Next> : unknown) : {};
export type ReplaceParamsInUrl = <U extends Url>(path: U, params: PathParameters<U>) => Url;
export declare const replaceParamsInUrl: ReplaceParamsInUrl;
export declare const keys: <Obj extends Record<string, unknown>>(obj: Obj) => (keyof Obj)[];
export {};

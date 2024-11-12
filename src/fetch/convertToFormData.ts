type RawQueryParams = { [key: string]: string | boolean | number };

export type QueryParams<T extends RawQueryParams> = {
  [K in keyof T]: T[K];
};

export const convertToFormData = <T extends QueryParams<RawQueryParams>>(
  params: T,
): string =>
  Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .map(
      ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");

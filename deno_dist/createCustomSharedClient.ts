import { configureCreateHttpClient } from "./configureCreateHttpClient.ts";
import { Handler, HttpClient } from "./configureCreateHttpClient.ts";
import { UnknownSharedRoute } from "./defineRoutes.ts";

export const createCustomSharedClient = <
  SharedRoutes extends Record<string, UnknownSharedRoute>,
>(
  sharedRoutes: SharedRoutes,
  customHandlers: {
    [K in keyof SharedRoutes]: Handler<SharedRoutes[K]>;
  },
): HttpClient<SharedRoutes> => {
  const createHttpClient = configureCreateHttpClient((routeName) => {
    return customHandlers[routeName] as any;
  }) as any;

  return createHttpClient(sharedRoutes);
};

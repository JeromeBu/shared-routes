import * as fs from "fs";
import { join as pathJoin } from "path";

const rootDirPath = pathJoin(__dirname, "..");

//NOTE: This is only required because of: https://github.com/garronej/ts-ci/blob/c0e207b9677523d4ec97fe672ddd72ccbb3c1cc4/README.md?plain=1#L54-L58
fs.writeFileSync(
  pathJoin(rootDirPath, "dist", "package.json"),
  Buffer.from(
    JSON.stringify(
      (() => {
        const packageJsonParsed = JSON.parse(
          fs.readFileSync(pathJoin(rootDirPath, "package.json")).toString("utf8"),
        );

        const { prepare, ...scripts } = packageJsonParsed["scripts"];

        return {
          ...packageJsonParsed,
          "main": packageJsonParsed["main"]?.replace(/^dist\//, ""),
          "types": packageJsonParsed["types"]?.replace(/^dist\//, ""),
          "module": packageJsonParsed["module"]?.replace(/^dist\//, ""),
          "scripts": scripts,
          "exports": Object.fromEntries(
            Object.entries(packageJsonParsed["exports"]).map(([path, obj]) => [
              path,
              Object.fromEntries(
                Object.entries(obj as Record<string, string>).map(([type, path]) => [
                  type,
                  path.replace(/^\.\/dist\//, "./"),
                ]),
              ),
            ]),
          ),
        };
      })(),
      null,
      2,
    ),
    "utf8",
  ),
);

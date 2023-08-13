import * as path from "node:path"
import { describe, it, expect } from "https://esm.sh/vitest@0.34.1";
import { getInstalledVersionPackageJsonFactory } from "../src/lib/getInstalledVersionPackageJson.ts"

const __dirname = (() => {
    const { url: urlStr } = import.meta;
    const url = new URL(urlStr);
    const __filename = (url.protocol === "file:" ? url.pathname : urlStr)
        .replace(/[/][^/]*$/, '');

    const isWindows = (() => {

        let NATIVE_OS: typeof Deno.build.os = "linux";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const navigator = (globalThis as any).navigator;
        if (globalThis.Deno != null) {
            NATIVE_OS = Deno.build.os;
        } else if (navigator?.appVersion?.includes?.("Win") ?? false) {
            NATIVE_OS = "windows";
        }

        return NATIVE_OS == "windows";

    })();

    return isWindows ?
        __filename.split("/").join("\\").substring(1) :
        __filename;
})();

describe("get the version of npm package installed from package.json", () => {
    it("should return the version of package installed", async () => {
        const { getInstalledVersionPackageJson } = getInstalledVersionPackageJsonFactory({
            "projectPath": path.join(__dirname, "..", "res", "test_resolve_1")
        });

        expect(await getInstalledVersionPackageJson({ "nodeModuleName": "js-yaml" })).toStrictEqual({
            version: "3.13.1"
        });
    });
});

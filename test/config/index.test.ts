import { describe, it, expect } from "https://esm.sh/vitest@0.34.1";
import getFileTypeAndContent from "../../src/lib/config/fileAndContent.ts"
import { parseAsDenoifyConfig } from "../../src/lib/config/parseParams.ts"
import { assert } from "https://esm.sh/tsafe@1.6.4/assert";

describe("parse denoify config params", () => {
    const configDummy = {
        out: "dist/index.ts",
        index: "./src/index.ts",
        ports: {
            awesome_module: "https://deno.land/xxx/xxx_module/mod.ts"
        }
    };

    it("should return undefined when there is no file to parse", () => {
        expect(
            parseAsDenoifyConfig({
                configFileType: {
                    type: "absent"
                }
            })
        ).toBeUndefined();
    });

    it("should parse each JSON config from '%s' and return the value of each key-value pairs", async () => {
        const configJson = "denoify.config.json";
        const configFileRawContent = JSON.stringify(configDummy);
        const configFileType = await getFileTypeAndContent({
            "getConfigFileRawContent": async configFileBasename => (configFileBasename !== configJson ? undefined : configFileRawContent)
        });

        expect(configFileType).toStrictEqual({
            type: "json",
            configFileBasename: configJson,
            configFileRawContent
        });

        const json = parseAsDenoifyConfig({
            configFileType
        });

        expect(json).toBeTruthy();
        assert(json !== undefined);
        expect(json.out).toBe(configDummy.out);
        expect(json.index).toBe(configDummy.index);
        expect(json.ports).toEqual(configDummy.ports);
    });

    it("should parse each JavaScript config and return the value of each key-value pairs", async () => {
        const configJs = "denoify.config.js";
        const configFileRawContent = `module.exports = ${JSON.stringify(configDummy)}`;
        const configFileType = await getFileTypeAndContent({
            "getConfigFileRawContent": async configFileBasename => (configFileBasename !== configJs ? undefined : configFileRawContent)
        });

        expect(configFileType).toStrictEqual({
            type: "js",
            configFileBasename: configJs,
            configFileRawContent
        });

        const js = parseAsDenoifyConfig({
            configFileType
        });

        expect(js).toBeTruthy();
        assert(js !== undefined);
        expect(js.out).toBe(configDummy.out);
        expect(js.index).toBe(configDummy.index);
        expect(js.ports).toEqual(configDummy.ports);
    });
});

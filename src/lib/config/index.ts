import { cosmiconfig } from "https://esm.sh/cosmiconfig@8.2.0";
import { parseAsDenoifyParams } from "./parseParams.ts"

const config = (() => {
    const packageJson = "package.json";
    return {
        packageJson,
        "supportedConfigFile": [packageJson, ...["json", "js"].map(extension => `denoify.config.${extension}`)],
        "getDenoifyParamsWithCosmiconfig": async () => {
            const explorer = cosmiconfig("denoify");
            const search = await explorer.search();
            if (search) {
                console.log(`Configurations from ${search.filepath} are used`);
            }
            return parseAsDenoifyParams(search?.config ?? undefined);
        }
    } as const;
})();

export default config;

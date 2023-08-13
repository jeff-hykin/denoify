import { describe, it, expect } from "https://esm.sh/vitest@0.34.1";
import { getThirdPartyDenoModuleInfos } from "../../../src/lib/getThirdPartyDenoModuleInfos.ts"
import { getValidImportUrlFactory } from "../../../src/lib/resolveNodeModuleToDenoModule.ts"
import { ModuleAddress } from "../../../src/lib/types/ModuleAddress.ts"
import { assert } from "https://esm.sh/tsafe@1.6.4/assert";

describe("test 2", () => {
    it("should fallback to available latest version and get the valid url file path for evt when the latest version specified is not available", async () => {
        const moduleAddress: ModuleAddress.GitHubRepo = {
            "type": "GITHUB REPO",
            "userOrOrg": "garronej",
            "repositoryName": "evt",
            "branch": undefined
        };

        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            "moduleAddress": moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            "version": "99.99.99"
        });

        assert(getValidImportUrlFactoryResult.couldConnect);

        const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;

        expect(typeof versionFallbackWarning).toBe("string");

        const { latestVersion } = (await getThirdPartyDenoModuleInfos({ "denoModuleName": "evt" }))!;

        expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe(`https://deno.land/x/evt@${latestVersion}/mod.ts`);

        expect(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "hooks/useEvt" })).toBe(
            `https://deno.land/x/evt@${latestVersion}/hooks/useEvt.ts`
        );

        expect(await getValidImportUrl({ "target": "SPECIFIC FILE", "specificImportPath": "hooks" })).toBe(
            `https://deno.land/x/evt@${latestVersion}/hooks/index.ts`
        );
    });

    //Makes sure it work when version tag is prefixed with a v.
    it("should get the latest version and its valid url file path for evt when the latest version specified is available", async () => {
        const moduleAddress: ModuleAddress.GitHubRepo = {
            "type": "GITHUB REPO",
            "userOrOrg": "garronej",
            "repositoryName": "evt",
            "branch": undefined
        };

        const getValidImportUrlFactoryResult = await getValidImportUrlFactory({
            moduleAddress,
            "desc": "MATCH VERSION INSTALLED IN NODE_MODULES",
            "version": "2.4.1"
        });

        assert(getValidImportUrlFactoryResult.couldConnect);

        const { versionFallbackWarning, getValidImportUrl } = getValidImportUrlFactoryResult;

        expect(versionFallbackWarning).toBeUndefined();

        expect(await getValidImportUrl({ "target": "DEFAULT EXPORT" })).toBe("https://deno.land/x/evt@v2.4.1/mod.ts");
    });
});

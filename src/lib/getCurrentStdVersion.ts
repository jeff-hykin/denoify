import { Version } from "../tools/Version.ts"
import { listTags } from "../tools/githubTags.ts"
import { addCache } from "../tools/addCache.ts"

export const getCurrentStdVersion = addCache(async () => {
    const stdBranch: string[] = [];

    for await (const branch of listTags({
        "owner": "denoland",
        "repo": "deno_std"
    })) {
        const match = branch.match(/^([0-9]+\.[0-9]+\.[0-9]+)$/);

        if (!match) {
            continue;
        }

        stdBranch.push(match[1]);
    }

    return Version.stringify(stdBranch.map(Version.parse).sort((vX, vY) => Version.compare(vY, vX))[0]);
});

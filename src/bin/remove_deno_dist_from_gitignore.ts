#!/usr/bin/env node

import { join as pathJoin, normalize as pathNormalize, dirname as pathDirname, basename as pathBasename } from "node:path"
import { getIsDryRun } from "./lib/getIsDryRun.ts"
import * as fs from "node:fs"
import * as commentJson from "https://esm.sh/comment-json@4.2.3";
import { removeFromGitignore } from "../tools/removeFromGitignore.ts"
import { toPosix } from "../tools/toPosix.ts"
import { parseAsDenoifyConfig } from "../lib/config/parseParams.ts"
import getFileTypeAndContent from "../lib/config/fileAndContent.ts"

const { getDenoifyOutDir } = (() => {
    async function getExplicitDenoifyOutDir(params: { moduleDirPath: string }) {
        const { moduleDirPath } = params;

        const denoifyOut = parseAsDenoifyConfig({
            "configFileType": await getFileTypeAndContent({
                "getConfigFileRawContent": fileBasename => {
                    const filePath = pathJoin(moduleDirPath, fileBasename);
                    if (!fs.existsSync(filePath)) {
                        return Promise.resolve(undefined);
                    }
                    return Promise.resolve(fs.readFileSync(filePath).toString("utf8"));
                }
            })
        })?.out;

        if (denoifyOut === undefined) {
            return undefined;
        }

        return pathNormalize(toPosix(denoifyOut));
    }

    function getTsconfigOutDir(params: { moduleDirPath: string }): string | undefined {
        const { moduleDirPath } = params;

        const tsconfigJson = fs.readFileSync(pathJoin(moduleDirPath, "tsconfig.json")).toString("utf8");

        const outDir: string | undefined = commentJson.parse(tsconfigJson)["compilerOptions"]?.["outDir"];

        if (typeof outDir !== "string") {
            return undefined;
        }

        return pathNormalize(toPosix(outDir));
    }

    async function getDenoifyOutDir(params: { moduleDirPath: string }) {
        const { moduleDirPath } = params;

        explicitely_specified: {
            const denoifyOutDir = await getExplicitDenoifyOutDir({ moduleDirPath });

            if (denoifyOutDir === undefined) {
                break explicitely_specified;
            }

            return denoifyOutDir;
        }

        default_based_on_tsconfig_outDir: {
            const tsconfigOutDir = getTsconfigOutDir({ moduleDirPath });

            if (tsconfigOutDir === undefined) {
                break default_based_on_tsconfig_outDir;
            }

            return pathJoin(
                pathDirname(tsconfigOutDir), // .
                `deno_${pathBasename(tsconfigOutDir)}` //deno_dist
            ); // deno_dist
        }

        return undefined;
    }

    return { getDenoifyOutDir };
})();

/**
 * To disable dry run mode  DRY_RUN=1 env variable must be set.
 * This function Change change the working directory.
 * */
export async function run(params: { moduleDirPath: string; isDryRun: boolean }) {
    const { moduleDirPath, isDryRun } = params;

    const denoifyOutDir = await getDenoifyOutDir({ moduleDirPath });

    if (denoifyOutDir === undefined) {
        throw new Error("Wrong assertion encountered");
    }

    if (!fs.existsSync(denoifyOutDir)) {
        console.log("exit 1");
        return;
    }

    const { fixedGitignoreRaw } = removeFromGitignore({
        "pathToTargetModule": moduleDirPath,
        "fileOrDirPathsToAccept": [denoifyOutDir]
    });

    if (!fixedGitignoreRaw) {
        console.log("exit 2");
        return;
    }

    console.log(`\n${isDryRun ? "(dry)" : ""} .gitignore:\n\n${fixedGitignoreRaw}`);

    if (isDryRun) {
        return;
    }

    fs.writeFileSync(".gitignore", Buffer.from(fixedGitignoreRaw, "utf8"));
}

if (require.main === module) {
    process.once("unhandledRejection", error => {
        throw error;
    });

    const { isDryRun } = getIsDryRun();

    run({
        "moduleDirPath": ".",
        isDryRun
    });
}

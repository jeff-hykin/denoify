"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const denoifySourceCodeString_1 = require("./denoifySourceCodeString");
const transformCodebase_1 = require("./transformCodebase");
const resolve_1 = require("./resolve");
const fs = require("fs");
const path = require("path");
async function run({ projectPath, srcDirPath = ["src", "lib"]
    .find(name => fs.existsSync(path.join(projectPath, name))) }) {
    var _a, _b, _c;
    const packageJsonParsed = require(path.join(projectPath, "package.json"));
    const { denoifySourceCodeString } = denoifySourceCodeString_1.denoifySourceCodeStringFactory(resolve_1.resolveFactory({
        projectPath,
        "denoDependencies": (_b = (_a = packageJsonParsed === null || packageJsonParsed === void 0 ? void 0 : packageJsonParsed.deno) === null || _a === void 0 ? void 0 : _a.dependencies) !== null && _b !== void 0 ? _b : {},
        devDependencies: Object.keys((_c = packageJsonParsed === null || packageJsonParsed === void 0 ? void 0 : packageJsonParsed.devDependencies) !== null && _c !== void 0 ? _c : {})
    }));
    const tsconfigOutDir = require(path.join(projectPath, "tsconfig.json"))
        .compilerOptions
        .outDir; // ./dist
    const denoDistPath = path.join(path.dirname(tsconfigOutDir), `deno_${path.basename(tsconfigOutDir)}`); // ./deno_dist
    await transformCodebase_1.transformCodebase({
        "srcDirPath": path.join(projectPath, srcDirPath),
        "destDirPath": path.join(projectPath, denoDistPath),
        "transformSourceCodeString": ({ extension, sourceCode, fileDirPath }) => /^\.?ts$/i.test(extension) || /^\.?js$/i.test(extension) ?
            denoifySourceCodeString({ sourceCode, fileDirPath })
            :
                Promise.resolve(sourceCode)
    });
    fs.writeFileSync(path.join(projectPath, "mod.ts"), Buffer.from([
        `export * from "`,
        path.join(denoDistPath, path.relative(tsconfigOutDir, packageJsonParsed.main // ./dist/lib/index.js
        ) // ./lib/index.js
        ) // ./deno_dist/lib/index.js
            .replace(/\.js$/i, ".ts"),
        `";`
    ].join(""), "utf8"));
}
exports.run = run;

import testParseParams from "./parseParams";
import testReplacer from "./replacer";
import testGetInstalledVersionPackageJson from "./getInstalledVersionPackageJson";
import testParsedImportExportStatementTypes from "./types/parsedImportExportStatement";

const tests: ReadonlyArray<readonly [() => void, "only"?]> = [
    [testParseParams],
    [testReplacer],
    [testGetInstalledVersionPackageJson],
    [testParsedImportExportStatementTypes, "only"]
];

const selectedTests = tests.filter(([_, only]) => only);

if (process.env.IS_CI && selectedTests.length) {
    throw new Error('cannot have "only" in ci cd');
}

(!selectedTests.length ? tests : selectedTests).forEach(([test]) => test());

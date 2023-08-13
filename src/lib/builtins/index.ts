import * as __dirnameBuiltin from "./__dirname.ts";
import * as __filenameBuiltin from "./__filename.ts";
import * as bufferBuiltin from "./buffer.ts";
import * as processBuiltin from "./process.ts";

/**
 * This is how we handle Node builtins
 *
 * Each module in this directory should export two functions:
 * - test: (sourceCode: string) => boolean returns true if the source code needs to be modified because it refers to a Node builtin
 * - modification: string[] the lines of code to prepend to the source code
 */
const builtins = [__filenameBuiltin, __dirnameBuiltin, bufferBuiltin, processBuiltin];

export default builtins;

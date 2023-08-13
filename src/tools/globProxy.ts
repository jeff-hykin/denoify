import * as glob from "https://esm.sh/glob@10.3.3";

export function globProxyFactory(params: { cwdAndRoot: string }) {
    const { cwdAndRoot } = params;

    function globProxy(params: { pathWithWildcard: string }): string[] {
        const { pathWithWildcard } = params;

        return glob.sync(pathWithWildcard, {
            "cwd": cwdAndRoot,
            "root": cwdAndRoot,
            "dot": true
        });
    }

    return { globProxy };
}

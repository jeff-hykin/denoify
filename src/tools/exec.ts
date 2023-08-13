import * as st from "https://esm.sh/scripting-tools@0.19.14";

export function execFactory(params: { isDryRun: boolean }) {
    const { isDryRun } = params;

    const exec: (cmd: string) => Promise<void> = !isDryRun
        ? async cmd => {
              console.log(`$ ${cmd}`);
              await st.exec(cmd);
          }
        : cmd => {
              console.log(`(dry)$ ${cmd}`);
              return Promise.resolve();
          };
    return { exec };
}

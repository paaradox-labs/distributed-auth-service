import fs from "node:fs";
import path from "node:path";

/**
 * Walks up from `startDir` until a directory containing `package.json` is found.
 * Works when this file lives under `src/config` or `dist/src/config` after build.
 */
export function findProjectRoot(startDir: string): string {
    let dir = path.resolve(startDir);
    for (;;) {
        if (fs.existsSync(path.join(dir, "package.json"))) {
            return dir;
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            throw new Error(`Could not find package.json above ${startDir}`);
        }
        dir = parent;
    }
}

/**
 * Absolute path to the dotenv file for a given NODE_ENV (falls back to "dev").
 */
export function resolveEnvFilePath(
    nodeEnv: string | undefined,
    configDirAbsolute: string,
): string {
    const root = findProjectRoot(configDirAbsolute);
    return path.join(root, `.env.${nodeEnv || "dev"}`);
}

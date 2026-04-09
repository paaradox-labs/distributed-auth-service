import path from "path";

/**
 * Absolute path to the dotenv file for a given NODE_ENV (falls back to "dev").
 */
export function resolveEnvFilePath(
    nodeEnv: string | undefined,
    configDirAbsolute: string,
): string {
    return path.join(configDirAbsolute, `../../.env.${nodeEnv || "dev"}`);
}

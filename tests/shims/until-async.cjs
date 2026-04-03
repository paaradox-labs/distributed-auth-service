/**
 * CJS shim for the ESM-only `until-async` package. MSW's CJS bundle does
 * `require("until-async")`, which Node rejects for `"type": "module"` deps.
 * API mirrors until-async@3 (see node_modules/until-async/lib/index.js).
 */
async function until(callback) {
    try {
        return [
            null,
            await callback().catch((error) => {
                throw error;
            }),
        ];
    } catch (error) {
        return [error, null];
    }
}

// eslint-disable-next-line no-undef
module.exports = { until };

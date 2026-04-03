import * as mockJwks from "mock-jwks";

/**
 * mock-jwks ships CJS (`dist/main.js`). Under Jest + native ESM, `import` can
 * expose `default`/`createJWKSMock` inconsistently — normalize to the factory.
 */
export function getCreateJWKSMock(): typeof import("mock-jwks").createJWKSMock {
    if (typeof mockJwks.createJWKSMock === "function") {
        return mockJwks.createJWKSMock;
    }
    const d = mockJwks.default;
    if (typeof d === "function") {
        return d as typeof import("mock-jwks").createJWKSMock;
    }
    if (d && typeof d === "object" && "createJWKSMock" in d) {
        const inner = (d as { createJWKSMock: unknown }).createJWKSMock;
        if (typeof inner === "function") {
            return inner as typeof import("mock-jwks").createJWKSMock;
        }
    }
    throw new Error(
        "mock-jwks: could not resolve createJWKSMock — check Jest ESM/CJS interop",
    );
}

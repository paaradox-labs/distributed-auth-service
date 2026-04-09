import { jest } from "@jest/globals";

/** Jest ESM + strict TS infer `jest.fn()` as `Mock<never>`; use this for `mockResolvedValue` / `mockRejectedValue`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockFn(): any {
    return jest.fn();
}

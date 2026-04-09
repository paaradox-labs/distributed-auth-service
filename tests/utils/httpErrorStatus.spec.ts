import type { HttpError } from "http-errors";
import { httpErrorStatus } from "../../src/utils/httpErrorStatus.js";

describe("httpErrorStatus", () => {
    it("prefers statusCode when it is set", () => {
        expect(httpErrorStatus({ statusCode: 422 } as HttpError)).toBe(422);
    });

    it("uses status when statusCode is missing", () => {
        expect(
            httpErrorStatus({
                status: 404,
                statusCode: undefined,
            } as unknown as HttpError),
        ).toBe(404);
    });

    it("defaults to 500 when neither is set", () => {
        expect(httpErrorStatus({} as HttpError)).toBe(500);
    });
});

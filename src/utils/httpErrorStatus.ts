import type { HttpError } from "http-errors";

/** Resolves HTTP status from an error passed to the global Express error handler. */
export function httpErrorStatus(err: HttpError): number {
    return err.statusCode || err.status || 500;
}

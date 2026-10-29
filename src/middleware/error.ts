import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

export type ErrorCode = "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: ContentfulStatusCode,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFound(message = "Resource not found"): AppError {
  return new AppError("NOT_FOUND", message, 404);
}

export function validationError(message: string): AppError {
  return new AppError("VALIDATION_ERROR", message, 400);
}

function formatZodMessage(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "value";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

/**
 * Unified error middleware: every failure becomes
 * { error: { code, message } } with VALIDATION_ERROR | NOT_FOUND | INTERNAL_ERROR.
 */
export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json(
      { error: { code: err.code, message: err.message } },
      err.status,
    );
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR" as const,
          message: formatZodMessage(err),
        },
      },
      400,
    );
  }

  if (err instanceof HTTPException) {
    const status = err.status;
    if (status === 404) {
      return c.json(
        {
          error: {
            code: "NOT_FOUND" as const,
            message: err.message || "Not found",
          },
        },
        404,
      );
    }
    if (status >= 400 && status < 500) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR" as const,
            message: err.message || "Bad request",
          },
        },
        status as ContentfulStatusCode,
      );
    }
  }

  console.error("Unhandled error:", err);
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR" as const,
        message: "An unexpected error occurred",
      },
    },
    500,
  );
};

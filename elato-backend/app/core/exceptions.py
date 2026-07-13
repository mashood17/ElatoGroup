"""
One error response shape for the entire API: {"error": {"code", "message"}}
so the frontend never special-cases error parsing per endpoint.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("elato.errors")


class AppError(Exception):
    """Base class for domain errors — raise this (or a subclass) from services, never a bare Exception."""

    def __init__(self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, message: str = "Not found"):
        super().__init__(code="not_found", message=message, status_code=status.HTTP_404_NOT_FOUND)


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(code="unauthorized", message=message, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(AppError):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(code="forbidden", message=message, status_code=status.HTTP_403_FORBIDDEN)


def _error_response(code: str, message: str, status_code: int) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"error": {"code": code, "message": message}})


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError):
        return _error_response(exc.code, exc.message, exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_: Request, exc: RequestValidationError):
        return _error_response("validation_error", "Request validation failed.", status.HTTP_422_UNPROCESSABLE_ENTITY)

    @app.exception_handler(StarletteHTTPException)
    async def http_error_handler(_: Request, exc: StarletteHTTPException):
        return _error_response("http_error", str(exc.detail), exc.status_code)

    @app.exception_handler(Exception)
    async def unhandled_error_handler(_: Request, exc: Exception):
        logger.exception("Unhandled exception")
        return _error_response("internal_error", "Something went wrong.", status.HTTP_500_INTERNAL_SERVER_ERROR)

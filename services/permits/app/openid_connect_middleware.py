from app.jwt_manager import validate_oidc_token
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse


class OpenIdConnectMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> JSONResponse:
        if request.url.path == "/docs" or request.url.path == "/openapi.json":
            # Allow swagger UI to load without auth
            return await call_next(request)

        authorization = request.headers.get("Authorization")
        if not authorization:
            return JSONResponse(
                status_code=401,
                content={"detail": "Not authenticated"},
            )
        is_valid, err = validate_oidc_token(authorization)

        if not is_valid:
            return JSONResponse(
                status_code=401,
                content={"detail": err},
            )

        response = await call_next(request)
        return response

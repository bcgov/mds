from starlette.middleware.base import RequestResponseEndpoint, BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.jwt_manager import validate_oidc_token


class OpenIdConnectMiddleware(BaseHTTPMiddleware):
    async def dispatch(
            self, request: Request, call_next: RequestResponseEndpoint
    ) -> JSONResponse:
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

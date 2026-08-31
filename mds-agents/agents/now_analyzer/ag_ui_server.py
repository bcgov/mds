"""NOW Application Analyzer — AG-UI (https://docs.ag-ui.com) FastAPI entry point.

Exposes the Magentic workflow from workflow.py as an AG-UI SSE endpoint so any
AG-UI-compatible client (see mds-agents/frontend) can drive the completeness
review over a standard event-streamed chat protocol.

Run with:
    python -m agents.now_analyzer.ag_ui_server

Environment variables:
    HOST         — bind host (default 127.0.0.1)
    PORT         — bind port (default 8000)
    CORS_ORIGINS — comma-separated list of allowed browser origins
                   (default http://localhost:5173, the frontend's Vite dev port)
"""

from __future__ import annotations

import os
from pathlib import Path

import uvicorn
from agent_framework.ag_ui import (
    AgentFrameworkWorkflow,
    add_agent_framework_fastapi_endpoint,
)
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .workflow import build_now_analyzer_workflow

load_dotenv()

app = FastAPI(title="NOW Application Analyzer — AG-UI")
REPORTS_DIRECTORY = Path.cwd() / "reports"

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    """Liveness check, registered before the AG-UI mount so it stays reachable."""
    return {"status": "ok"}


@app.get("/reports/{report_name}")
async def download_report(report_name: str) -> FileResponse:
    """Serve a generated workbook without exposing arbitrary filesystem paths."""
    report_path = (REPORTS_DIRECTORY / report_name).resolve()
    if (
        report_path.parent != REPORTS_DIRECTORY.resolve()
        or report_path.name != report_name
        or report_path.suffix.lower() != ".xlsx"
        or not report_path.is_file()
    ):
        raise HTTPException(status_code=404, detail="Report not found.")

    return FileResponse(
        path=report_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=report_path.name,
    )


# A fresh workflow per AG-UI thread keeps Magentic's round-count state isolated across concurrent runs.
now_analyzer_workflow = AgentFrameworkWorkflow(
    workflow_factory=lambda thread_id: build_now_analyzer_workflow(),
    name="now_analyzer",
    description="BC mining Notice of Work (NOW) application completeness review.",
)

add_agent_framework_fastapi_endpoint(
    app=app,
    agent=now_analyzer_workflow,
    path="/now-analyzer",
)


def main() -> None:
    """Run the AG-UI backend."""
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    print(f"NOW Analyzer AG-UI backend running at http://{host}:{port}")
    print("AG-UI endpoint: POST /now-analyzer")
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    main()

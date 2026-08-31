# NOW Analyzer — AG-UI Frontend

Standalone Vite + React 18 client that talks to the `now_analyzer` Magentic
workflow over the [AG-UI](https://docs.ag-ui.com) protocol.

## Run

Backend (from `mds-agents/`):

```bash
python -m agents.now_analyzer.ag_ui_server
```

Frontend (from this folder):

```bash
cp .env.example .env   # adjust VITE_AGENT_URL if the backend isn't on 127.0.0.1:8000
npm install
npm run dev
```

Open the printed Vite URL (default `http://127.0.0.1:5173`). Enter a NOW
application GUID and ask for a complete review, or use a starter prompt. The
same conversation can then be used for focused follow-up questions about that
application.

## Interface capabilities

- Live AG-UI text streaming with an expandable tool activity timeline.
- Browser-local conversation history; create, rename, switch, or delete an
	analysis without losing its visible transcript after a page reload.
- GitHub-flavored Markdown responses, response copy control, and a stop button
	for an active request.
- Generated `.xlsx` reports are available through the download action in the
	agent response. The backend serves them at `GET /reports/{report_name}`.

The agent workflow state is owned by the running backend process. Reloading a
browser restores its local transcript, but a restarted backend begins a new
server-side workflow for that conversation ID.

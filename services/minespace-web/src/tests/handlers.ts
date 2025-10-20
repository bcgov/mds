import commonHandlers from "@mds/common/tests/handlers";
import { http, HttpResponse } from "msw";
import queryString from "query-string";
import {
  PERMITS as MOCK_PERMITS,
  MINE_REPORT_RESPONSE as MOCK_MINE_REPORT_RESPONSE,
} from "@mds/common/tests/mocks/dataMocks";

// Exported for tests to assert request parameters
export let lastMineReportsRequest: { mineGuid: string; query: any } | null = null;
export let lastPermitsRequest: { mineGuid: string } | null = null;

// Handle GET mine reports with optional multiple mine_reports_type params
const mineReportsHandler = http.get(
  "/%3CAPI_URL%3E/mines/:mineGuid/reports",
  async ({ params, request }) => {
    const { mineGuid } = params as { mineGuid: string };
    const url = new URL(request.url);
    const qs = queryString.parse(url.searchParams.toString());
    lastMineReportsRequest = { mineGuid, query: qs };

    // Respect per_page if provided; default to the mock count
    const perPageRaw = qs.per_page as string | string[] | undefined;
    const perPage = Array.isArray(perPageRaw)
      ? parseInt(perPageRaw[0] ?? "", 10)
      : parseInt(perPageRaw ?? "", 10);
    const effectivePerPage = Number.isFinite(perPage)
      ? perPage
      : MOCK_MINE_REPORT_RESPONSE.records.length;

    const records = MOCK_MINE_REPORT_RESPONSE.records.slice(0, effectivePerPage);
    const response = {
      ...MOCK_MINE_REPORT_RESPONSE,
      records,
      items_per_page: effectivePerPage,
    };
    return HttpResponse.json(response);
  }
);

// Handle GET permits for a mine
const permitsHandler = http.get("/%3CAPI_URL%3E/mines/:mineGuid/permits", async ({ params }) => {
  const { mineGuid } = params as { mineGuid: string };
  lastPermitsRequest = { mineGuid };
  return HttpResponse.json({ records: MOCK_PERMITS });
});

const handlers = [mineReportsHandler, permitsHandler, ...commonHandlers];

export default handlers;
export { mineReportsHandler, permitsHandler };

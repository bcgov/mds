import { http, HttpResponse } from "msw";
import {
  GEOMARK_DATA,
  HELP_GUIDE_CORE,
  HELP_GUIDE_MS,
  MINE_REPORT_CATEGORY_OPTIONS,
  MINE_REPORT_DEFINITION_OPTIONS,
  PERMIT_CONDITION_EXTRACTION,
  PROJECT,
  PROJECT_SUMMARY_MINISTRY_COMMENTS,
  SEARCH_PERMIT_CONDITIONS_RESPONSE,
} from "@mds/common/tests/mocks/dataMocks";
import queryString from "query-string";
import { SystemFlagEnum } from "../constants/enums";

const geoSpatialHandlers = [
  http.get("/%3CAPI_URL%3E/mines/document-bundle/shape", async () => {
    return HttpResponse.json(GEOMARK_DATA);
  }),
];

const projectHandlers = [
  http.get("/%3CAPI_URL%3E/projects/35633148-57f8-4967-be35-7f89abfbd02e", async () => {
    return HttpResponse.json(PROJECT);
  }),
  http.get(
    "/%3CAPI_URL%3E/projects/70414192-ca71-4d03-93a5-630491e9c554/ministry-comments",
    async () => {
      return HttpResponse.json(PROJECT_SUMMARY_MINISTRY_COMMENTS);
    }
  ),
];

const permitHandlers = [
  http.get("/%3CAPI_URL%3E/mines/permits/condition-extraction", async () => {
    return HttpResponse.json({
      "tasks": PERMIT_CONDITION_EXTRACTION
    })
  }),
  http.get("/%3CAPI_URL%3E/mines/permits/condition-category-codes", async () => {
    return HttpResponse.json(MINE_REPORT_CATEGORY_OPTIONS)
  }),
];

const permitSearchHandlers = [
  http.post(
    `/%3CAPI_URL%3E/search/permit-conditions`,
    async ({ request, params }) => {
      const requestBody = await request.json() as { query: string };

      // Mock different responses based on search query
      if (requestBody?.query?.includes('water')) {
        return HttpResponse.json(SEARCH_PERMIT_CONDITIONS_RESPONSE);
      }

      return HttpResponse.json({ documents: [], prompt: { answers: [] }, facets: {} });
    }
  )
];

const helpHandler = http.get("/%3CAPI_URL%3E/help/:helpKey", async ({ request, params }) => {
  const { helpKey } = params;
  const url = new URL(request.url);
  const system = url.searchParams.get("system");

  const guideData = system === SystemFlagEnum.core ? HELP_GUIDE_CORE : HELP_GUIDE_MS;

  const response = { records: [...guideData[helpKey as string]] };
  return HttpResponse.json(response);
});

const complianceReportHandler = http.get("/%3CAPI_URL%3E/mines/reports/definitions", async ({ request }) => {
  const url = new URL(request.url);
  const paramString = queryString.parse(url.searchParams.toString())
  const { page = 1, per_page = MINE_REPORT_DEFINITION_OPTIONS.length } = paramString;

  const complianceReportData = MINE_REPORT_DEFINITION_OPTIONS.slice(0, per_page);

  const response = {
    records: complianceReportData,
    current_page: page,
    items_per_Page: per_page,
    total: MINE_REPORT_DEFINITION_OPTIONS.length,
    total_pages: Math.ceil(per_page / page)
  };
  return HttpResponse.json(response);
});

const commonHandlers = [...geoSpatialHandlers, ...projectHandlers, helpHandler, ...permitHandlers, ...permitSearchHandlers, complianceReportHandler];

export default commonHandlers;

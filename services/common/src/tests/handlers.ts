import { http, HttpResponse } from "msw";
import {
  GEOMARK_DATA,
  HELP_GUIDE_CORE,
  HELP_GUIDE_MS,
  MINE_REPORT_CATEGORY_OPTIONS,
  MINE_REPORT_DEFINITION_OPTIONS,
  PERMIT_CONDITION_EXTRACTION,
  PERMIT_CONDITION_REVIEW_ASSIGNMENTS,
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
  // Use localhost URL pattern for better compatibility with the fetch adapter
  http.post(
    "http://localhost/search/permit-conditions",
    async ({ request }) => {
      const requestBody = await request.json() as { query: string };
      let responseData;

      // Mock different responses based on search query
      if (requestBody?.query?.includes('water')) {
        responseData = SEARCH_PERMIT_CONDITIONS_RESPONSE;
      } else {
        responseData = { documents: [], prompt: { answers: [] }, facets: {} };
      }

      const encoder = new TextEncoder();

      // Create a ReadableStream to simulate SSE events
      const stream = new ReadableStream({
        start(controller) {
          // Format and send the documents event
          const documentsAndFacets = {
            documents: responseData.documents || [],
            facets: responseData.facets || {}
          };
          controller.enqueue(
            encoder.encode(`event: documentsdata: ${JSON.stringify(documentsAndFacets)}ENDMESSAGE`)
          );

          // Send AI start event
          controller.enqueue(
            encoder.encode(`event: ai_startdata: {}ENDMESSAGE`)
          );

          // Send prompt event if there's an answer
          const promptText = responseData.prompt?.answers?.[0] || '';
          if (promptText) {
            controller.enqueue(
              encoder.encode(`event: promptdata: ${JSON.stringify({ answers: [promptText] })}ENDMESSAGE`)
            );
          }

          // Send AI complete event
          controller.enqueue(
            encoder.encode(`event: ai_completedata: {}ENDMESSAGE`)
          );

          // Send completion event
          controller.enqueue(
            encoder.encode(`event: completedata: {}ENDMESSAGE`)
          );

          // Close the stream
          controller.close();
        }
      });

      return new HttpResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
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

const reviewAssignmentHandler = http.get("/%3CAPI_URL%3E/mines/permits/condition-category/assign-review-user", async ({ request }) => {
  const url = new URL(request.url);
  const paramString = queryString.parse(url.searchParams.toString())
  const { permit_amendment_id } = paramString;

  const assignments = PERMIT_CONDITION_REVIEW_ASSIGNMENTS.filter((assignment) => assignment.permit_amendment_id == permit_amendment_id);
  const response = {
    records: assignments
  };
  return HttpResponse.json(response);
});

const commonHandlers = [...geoSpatialHandlers, ...projectHandlers, helpHandler, ...permitHandlers, ...permitSearchHandlers, complianceReportHandler, reviewAssignmentHandler];

export default commonHandlers;

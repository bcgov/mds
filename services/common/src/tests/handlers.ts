import { http, HttpResponse } from "msw";
import {
  GEOMARK_DATA,
  HELP_GUIDE_CORE,
  HELP_GUIDE_MS,
  MINE_REPORT_CATEGORY_OPTIONS,
  MINE_REPORT_DEFINITION_OPTIONS,
  MINES,
  PERMIT_CONDITION_EXTRACTION,
  PERMIT_CONDITION_REVIEW_ASSIGNMENTS,
  PERMITS,
  PROJECT,
  PROJECT_SUMMARY_MINISTRY_COMMENTS,
  SEARCH_PERMIT_CONDITIONS_RESPONSE,
  AMS_ENVIRONMENT_AUTH_STATUS_RESPONSE,
} from "@mds/common/tests/mocks/dataMocks";
import queryString from "query-string";
import { SystemFlagEnum } from "../constants/enums";
import { SearchEventType } from "../redux/slices/permitSearchSlice";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const mineHandlers = [
  http.get("/%3CAPI_URL%3E/mines/:mineGuid", async ({ params }) => {
    const { mineGuid } = params;
    const mine = MINES.mines[mineGuid as string];
    if (mine) {
      return HttpResponse.json(mine);
    }
    return HttpResponse.json({
      message: "404 Not Found: Mine not found.",
      status: 404,
      trace_id: "mineHandler_404",
    });
  }),
  http.get("/%3CAPI_URL%3E/mines/18133c75-49ad-4101-85f3-a43e35ae989a/alerts", async () => {
    return HttpResponse.json(MOCK.MINE_ALERTS);
  }),
];

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
  http.post(
    "/%3CAPI_URL%3E/projects/project-summary-environment-authorization-statuses", async () => {
      return HttpResponse.json(AMS_ENVIRONMENT_AUTH_STATUS_RESPONSE);
    }
  )
];

const permitHandlers = [
  http.get("/%3CAPI_URL%3E/mines/permits/condition-extraction", async () => {
    return HttpResponse.json({
      tasks: PERMIT_CONDITION_EXTRACTION,
    });
  }),
  http.get("/%3CAPI_URL%3E/mines/permits/condition-category-codes", async () => {
    return HttpResponse.json(MINE_REPORT_CATEGORY_OPTIONS);
  }),
  http.get(
    "/%3CAPI_URL%3E/mines/:mineGuid/permits/:permitGuid/amendments/:permitAmendmentGuid/conditions",
    async ({ params }) => {
      const { _mineGuid, permitGuid, permitAmendmentGuid } = params;
      const permit = PERMITS.find((permit) => permit.permit_guid === permitGuid);
      const permitAmendment = permit?.permit_amendments?.find(
        (amendment) => amendment.permit_amendment_guid === permitAmendmentGuid
      );

      if (permitAmendment) {
        const resp = { records: permitAmendment?.conditions };
        return HttpResponse.json(resp);
      }
      return HttpResponse.json({
        message: "404 Not Found: Permit Amendment not found.",
        status: 404,
        trace_id: "permitHandler_conditions_404",
      });
    }
  ),
  http.get(
    "/%3CAPI_URL%3E/mines/:mineGuid/permits/:permitGuid/amendments/:permitAmendmentGuid",
    async ({ params }) => {
      const { _mineGuid, permitGuid, permitAmendmentGuid } = params;
      const permit = PERMITS.find((permit) => permit.permit_guid === permitGuid);
      const permitAmendment = permit?.permit_amendments?.find(
        (amendment) => amendment.permit_amendment_guid === permitAmendmentGuid
      );

      if (permitAmendment) {
        return HttpResponse.json(permitAmendment);
      }
      return HttpResponse.json({
        message: "404 Not Found: Permit Amendment not found.",
        status: 404,
        trace_id: "permitHandler_conditions_404",
      });
    }
  ),
];

const permitSearchHandlers = [
  http.post("/%3CAPI_URL%3E/search/permit-conditions", async ({ request }) => {
    const requestBody = (await request.json()) as { query: string };
    let responseData;

    // Mock different responses based on search query
    if (requestBody?.query?.includes("water")) {
      responseData = SEARCH_PERMIT_CONDITIONS_RESPONSE;
    } else {
      responseData = { documents: [], prompt: { answers: [] }, facets: {} };
    }

    const encoder = new TextEncoder();

    // Pass along the response data as an event stream
    const stream = new ReadableStream({
      start(controller) {
        const documentsAndFacets = {
          documents: responseData.documents || [],
          facets: responseData.facets || {},
        };
        controller.enqueue(
          encoder.encode(
            `event: ${SearchEventType.DOCUMENTS}\ndata: ${JSON.stringify(documentsAndFacets)}\n\n`
          )
        );

        controller.enqueue(encoder.encode(`event: ${SearchEventType.AI_START}\ndata: {}\n\n`));

        const promptText = responseData.prompt?.answers?.[0] || "";
        if (promptText) {
          controller.enqueue(
            encoder.encode(
              `event: ${SearchEventType.PROMPT}\ndata: ${JSON.stringify({ answers: [promptText] })}\n\n`
            )
          );
        }

        controller.enqueue(encoder.encode(`event: ${SearchEventType.AI_COMPLETE}\ndata: {}\n\n`));

        controller.enqueue(encoder.encode(`event: ${SearchEventType.COMPLETE}\ndata: {}\n\n`));

        controller.close();
      },
    });

    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }),
];

const helpHandler = http.get("/%3CAPI_URL%3E/help/:helpKey", async ({ request, params }) => {
  const { helpKey } = params;
  const url = new URL(request.url);
  const system = url.searchParams.get("system");

  const guideData = system === SystemFlagEnum.core ? HELP_GUIDE_CORE : HELP_GUIDE_MS;

  const response = { records: [...guideData[helpKey as string]] };
  return HttpResponse.json(response);
});

const complianceReportHandler = http.get(
  "/%3CAPI_URL%3E/mines/reports/definitions",
  async ({ request }) => {
    const url = new URL(request.url);
    const paramString = queryString.parse(url.searchParams.toString());
    const { page = 1, per_page = MINE_REPORT_DEFINITION_OPTIONS.length } = paramString;

    const complianceReportData = MINE_REPORT_DEFINITION_OPTIONS.slice(0, per_page);

    const response = {
      records: complianceReportData,
      current_page: page,
      items_per_Page: per_page,
      total: MINE_REPORT_DEFINITION_OPTIONS.length,
      total_pages: Math.ceil(per_page / page),
    };
    return HttpResponse.json(response);
  }
);

const reviewAssignmentHandler = http.get(
  "/%3CAPI_URL%3E/mines/permits/condition-category/assign-review-user",
  async ({ request }) => {
    const url = new URL(request.url);
    const paramString = queryString.parse(url.searchParams.toString());
    const { permit_amendment_id } = paramString;

    const assignments = PERMIT_CONDITION_REVIEW_ASSIGNMENTS.filter(
      (assignment) => assignment.permit_amendment_id == permit_amendment_id
    );
    const response = {
      records: assignments,
    };
    return HttpResponse.json(response);
  }
);

const commonHandlers = [
  ...mineHandlers,
  ...geoSpatialHandlers,
  ...projectHandlers,
  helpHandler,
  ...permitHandlers,
  ...permitSearchHandlers,
  complianceReportHandler,
  reviewAssignmentHandler,
];

export default commonHandlers;

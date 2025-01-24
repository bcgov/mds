import { http, HttpResponse } from "msw";
import {
  GEOMARK_DATA,
  HELP_GUIDE_CORE,
  HELP_GUIDE_MS,
  MINE_REPORT_CATEGORY_OPTIONS,
  PERMIT_CONDITION_EXTRACTION,
  PROJECT,
  PROJECT_SUMMARY_MINISTRY_COMMENTS,
} from "@mds/common/tests/mocks/dataMocks";
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


]

const helpHandler = http.get("/%3CAPI_URL%3E/help/:helpKey", async ({ request, params }) => {
  const { helpKey } = params;
  const url = new URL(request.url);
  const system = url.searchParams.get("system");

  const guideData = system === SystemFlagEnum.core ? HELP_GUIDE_CORE : HELP_GUIDE_MS;

  const response = { records: [...guideData[helpKey as string]] };
  return HttpResponse.json(response);
});

const commonHandlers = [...geoSpatialHandlers, ...projectHandlers, helpHandler, ...permitHandlers];

export default commonHandlers;

import { http, HttpResponse } from "msw";
import { GEOMARK_DATA, PROJECT } from "@mds/common/tests/mocks/dataMocks";

const geoSpatialHandlers = [
  http.get("/%3CAPI_URL%3E/mines/document-bundle/shape", async () => {
    return HttpResponse.json(GEOMARK_DATA);
  }),
];

const projectHandlers = [
  http.get("/%3CAPI_URL%3E/projects/35633148-57f8-4967-be35-7f89abfbd02e", async () => {
    return HttpResponse.json(PROJECT);
  }),
];

const commonHandlers = [...geoSpatialHandlers, ...projectHandlers];

export default commonHandlers;

import { http, HttpResponse } from "msw";
import { GEOMARK_DATA } from "@mds/common/tests/mocks/dataMocks";

const geoSpatialHandlers = [
  http.get("/%3CAPI_URL%3E/mines/document-bundle/shape", async () => {
    return HttpResponse.json(GEOMARK_DATA);
  }),
];

const handlers = [...geoSpatialHandlers];

export default handlers;

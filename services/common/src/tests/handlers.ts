import { http, HttpResponse } from "msw";

const geoSpatialHandlers = [
  http.get("/%3CAPI_URL%3E/mines/document-bundle/shape", async () => {
    return HttpResponse.json({
      bundle_id: "17",
      bundle_guid: "8bc450d7-3ad0-4417-82f3-c90d33ae56b4",
      name: "gm-68784BEB127941D5AA703E3E7CE6E728.prj",
      geomark_id: "gm-57A8E3675DE04A889E418E846C53C394",
      docman_bundle_guid: "3249a079-10dd-44ec-8db6-bff7177e3151",
    });
  }),
];

const handlers = [...geoSpatialHandlers];

export default handlers;

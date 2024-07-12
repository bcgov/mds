import React from "react";
import { render } from "@testing-library/react";
import { PROJECTS } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import ViewSpatialDetail from "./ViewSpatialDetail";
import {
  spatialBundlesFromFiles,
  spatialDataReducerType,
} from "@mds/common/redux/slices/spatialDataSlice";
import { MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE } from "@mds/common/constants";

const spatialDocuments = MOCK.PROJECT_SUMMARY.documents.filter(
  (d) => d.project_summary_document_type_code === MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.SPATIAL
);
const spatialBundles = spatialBundlesFromFiles(spatialDocuments);
const bundle_id = spatialBundles[0].bundle_id;

const initialState = {
  [PROJECTS]: {
    projectSummary: MOCK.PROJECT_SUMMARY,
  },
  [spatialDataReducerType]: {
    geoJsonData: MOCK.GEOJSON_FEATURE_DATA,
    bundle_id,
    spatialBundle: spatialBundles[0],
  },
};

// mock the map to not show the Suspense component during render/lazy loading
jest.mock("@mds/common/components/common/Map", () => {
  return jest.requireActual("@mds/common/components/common/LeafletMap");
});

describe("ViewSpatialDetail", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ViewSpatialDetail spatialDocuments={spatialBundles[0].bundleFiles} />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { PROJECTS } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import ViewSpatialDetail, { GeomarkMapPreview } from "./ViewSpatialDetail";
import {
  groupSpatialBundles,
  spatialDataReducerType,
} from "@mds/common/redux/slices/spatialDataSlice";
import { getStore } from "@mds/common/redux/rootState";
import { MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE } from "@mds/common/constants/strings";

const spatialDocuments = MOCK.PROJECT_SUMMARY.documents.filter(
  (d) => d.project_summary_document_type_code === MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.SPATIAL
);
const spatialBundles = groupSpatialBundles(spatialDocuments);
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

  it("renders GeoMark geometry with the existing map component", async () => {
    const store = {
      getState: () => initialState,
      subscribe: () => () => undefined,
      dispatch: jest.fn().mockReturnValue({
        unwrap: () => Promise.resolve(MOCK.GEOJSON_FEATURE_DATA),
      }),
    };

    render(
      <Provider store={store as any}>
        <GeomarkMapPreview geomarkId="gm-test" />
      </Provider>
    );

    await waitFor(() => expect(document.getElementById("leaflet-map")).toBeInTheDocument());
  });

  it("shows an unavailable state when GeoMark geometry cannot be loaded", async () => {
    const store = {
      getState: () => ({
        ...initialState,
        [spatialDataReducerType]: {
          ...initialState[spatialDataReducerType],
          geoJsonData: null,
        },
      }),
      subscribe: () => () => undefined,
      dispatch: jest.fn().mockReturnValue({
        unwrap: () => Promise.reject(new Error("GeoMark unavailable")),
      }),
    };

    render(
      <Provider store={store as any}>
        <GeomarkMapPreview geomarkId="gm-test" />
      </Provider>
    );

    expect(await screen.findByText("Map preview unavailable")).toBeInTheDocument();
  });

  it("does not request map data when fetching the bundle is rejected", async () => {
    const stateWithoutSpatialData = {
      ...getStore(initialState).getState(),
      [spatialDataReducerType]: {
        geoJsonData: null,
        bundle_id: null,
        spatialBundle: null,
      },
    };
    const store = {
      getState: () => stateWithoutSpatialData,
      subscribe: () => () => undefined,
      dispatch: jest.fn().mockResolvedValue({
        type: "spatialData/fetchSpatialBundle/rejected",
      }),
    };

    render(
      <Provider store={store as any}>
        <ViewSpatialDetail spatialDocuments={spatialBundles[0].bundleFiles} />
      </Provider>
    );

    await waitFor(() => expect(store.dispatch).toHaveBeenCalledTimes(1));
  });

  it("loads map data directly when the document already has a GeoMark id", async () => {
    const stateWithoutBundle = {
      ...getStore(initialState).getState(),
      [spatialDataReducerType]: {
        geoJsonData: null,
        bundle_id: null,
        spatialBundle: null,
      },
    };
    const store = {
      getState: () => stateWithoutBundle,
      subscribe: () => () => undefined,
      dispatch: jest.fn().mockResolvedValue({
        type: "spatialData/fetchGeomarkMapData/fulfilled",
      }),
    };
    const documentsWithGeomark = spatialBundles[0].bundleFiles.map((document) => ({
      ...document,
      geomark_id: "gm-existing",
    }));

    render(
      <Provider store={store as any}>
        <ViewSpatialDetail spatialDocuments={documentsWithGeomark} />
      </Provider>
    );

    await waitFor(() => expect(store.dispatch).toHaveBeenCalled());
  });
});

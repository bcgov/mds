import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { formatDate } from "../utils/helpers";
import { IGeoJsonFeature } from "@mds/common/interfaces/document/geojsonFeature.interface";
import { ISpatialBundle } from "@mds/common/interfaces/document/spatialBundle.interface";
import { IMineDocument } from "@mds/common/interfaces/mineDocument.interface";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { COMPLETE_SPATIAL_BUNDLE, CORE_API_DOCUMENT_BUNDLE } from "@mds/common/constants/API";
import { isRequiredShapefilePart, isSingleFileSpatialFilename, isSpatialFilename } from "@mds/common/utils/spatialFiles";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

export const spatialDataReducerType = "spatialData";

export const groupSpatialBundles = (files: IMineDocument[]) => {
  const temp_indiv = files.filter((f) => isSingleFileSpatialFilename(f.document_name));

  const temp_spatial = files
    .filter((f) => isSpatialFilename(f.document_name) && !isSingleFileSpatialFilename(f.document_name))
    .map((f) => {
      return {
        ...f,
        mine_document_bundle_id: f.mine_document_bundle_id ?? f.document_name.split(".")[0],
      };
    });

  const spatial_bundle_ids = Array.from(
    new Set(temp_spatial.map((f) => f.mine_document_bundle_id).filter(Boolean))
  );

  const spatial_bundles = spatial_bundle_ids.map((id) => {
    const bundleFiles = temp_spatial
      .filter((f) => f.mine_document_bundle_id === id)
      .map((f) => ({ ...f, key: f.document_manager_guid }));

    const bundleSize = bundleFiles.length;
    const document_name = bundleFiles[0].document_name.split(".")[0];
    const create_user = bundleFiles[0].create_user;
    const upload_date = bundleFiles[0]?.upload_date
      ? bundleFiles.sort((a, b) => a.upload_date.localeCompare(b.upload_date))[0].upload_date
      : formatDate(new Date());

    return {
      document_name,
      bundleFiles,
      upload_date,
      create_user,
      bundleSize,
      bundle_id: id,
      key: id,
      isParent: true,
      isSingleFile: false,
    };
  }).filter((bundle) => bundle.bundleFiles.some((file) => isRequiredShapefilePart(file.document_name)));

  const individualFiles = temp_indiv.map((f) => {
    return {
      ...f,
      bundle_id: f.mine_document_bundle_id ?? f.document_name.split(".")[0],
      key: f.document_manager_guid,
      bundleFiles: [f],
      isParent: true,
      isSingleFile: true,
    };
  });

  return [...spatial_bundles, ...individualFiles];
};

interface SpatialDataState {
  geoJsonData: IGeoJsonFeature;
  bundle_id: string;
  spatialBundle: ISpatialBundle;
}

const initialState: SpatialDataState = {
  geoJsonData: null,
  bundle_id: null,
  spatialBundle: null,
};

const spatialSlice = createAppSlice({
  name: spatialDataReducerType,
  initialState,
  reducers: (create) => ({
    clearSpatialData: create.reducer((state) => {
      state.geoJsonData = null;
      state.bundle_id = null;
      state.spatialBundle = null;
    }),
    fetchGeomarkMapData: create.asyncThunk(
      async (geomark_id: string, thunkAPI) => {
        thunkAPI.dispatch(showLoading());
        const geomark_link = `${ENVIRONMENT.geoMarkUrl}/geomarks/${encodeURIComponent(geomark_id)}`;

        const suffix = "/feature.geojson";
        const url = `${geomark_link}${suffix}`;

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(url);

        thunkAPI.dispatch(hideLoading());
        return { mapData: response.data };
      },
      {
        fulfilled: (state, action) => {
          state.geoJsonData = action.payload.mapData;
        },
        rejected: (_state, action) => {
          rejectHandler(action);
        },
      }
    ),
    fetchSpatialBundle: create.asyncThunk(
      async (
        payload: { mineGuid: string; mine_document_bundle_id: string | number },
        thunkAPI
      ) => {
        thunkAPI.dispatch(showLoading());
        const headers = createRequestHeader();
        const url = `${ENVIRONMENT.apiUrl}${CORE_API_DOCUMENT_BUNDLE(
          payload.mineGuid,
          payload.mine_document_bundle_id
        )}`;
        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(url, headers);
        thunkAPI.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state, action) => {
          state.spatialBundle = action.payload;
          state.bundle_id = action.payload.mine_document_bundle_id;
        },
        rejected: (_state, action) => {
          rejectHandler(action);
        },
      }
    ),
    createDocmanSpatialBundle: create.asyncThunk(
      async (payload: { bundle_document_guids: string[]; name: string }, thunkAPI) => {
        const url = `${ENVIRONMENT.docManUrl}${COMPLETE_SPATIAL_BUNDLE}`;

        const headers = createRequestHeader();
        thunkAPI.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).patch(url, payload, headers);
        thunkAPI.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state, action) => {
          state.spatialBundle = action.payload;
          state.bundle_id = action.payload.bundle_id;
        },
        rejected: (_state, action) => {
          rejectHandler(action);
        },
      }
    ),
    updateSpatialBundlePurposes: create.asyncThunk(
      async (
        payload: {
          mineGuid: string;
          bundle_id: string | number;
          purpose_codes: string[];
        },
        thunkAPI
      ) => {
        const headers = createRequestHeader();
        const url = `${ENVIRONMENT.apiUrl}${CORE_API_DOCUMENT_BUNDLE(
          payload.mineGuid,
          payload.bundle_id
        )}`;
        thunkAPI.dispatch(showLoading());
        const response = await CustomAxios({
          errorToastMessage: "default",
          successToastMessage: "Spatial purpose updated",
        }).patch(
          url,
          {
            purpose_codes: payload.purpose_codes,
          },
          headers
        );
        thunkAPI.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state, action) => {
          state.spatialBundle = action.payload;
          state.bundle_id = action.payload.bundle_id;
        },
        rejected: (_state, action) => {
          rejectHandler(action);
        },
      }
    ),
  }),
  selectors: {
    getGeomarkMapData: (state: SpatialDataState) => {
      return state.geoJsonData;
    },
    getSpatialBundleGuid: (state: SpatialDataState) => {
      return state.bundle_id;
    },
    getSpatialBundle: (state: SpatialDataState) => {
      return state.spatialBundle;
    },
  },
});

export const {
  createDocmanSpatialBundle,
  fetchGeomarkMapData,
  clearSpatialData,
  fetchSpatialBundle,
  updateSpatialBundlePurposes,
} = spatialSlice.actions;
export const { getGeomarkMapData, getSpatialBundleGuid, getSpatialBundle } = spatialSlice.selectors;
export const spatialDataReducer = spatialSlice.reducer;
export default spatialDataReducer;

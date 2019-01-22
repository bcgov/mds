import {
  getMineRegionOptions,
  getMineStatusOptions,
  getMineRegionHash,
  getMineTSFRequiredReports,
  getMineTenureTypesHash,
  getMineTenureTypes,
  getMineDisturbanceOptions,
  getMineCommodityOptions,
  getDropdownCommodityOptions,
} from "@/selectors/staticContentSelectors";
import staticContentReducer from "@/reducers/staticContentReducer";
import {
  storeStatusOptions,
  storeRegionOptions,
  storeMineTSFRequiredDocuments,
  storeTenureTypes,
  storeDisturbanceOptions,
  storeCommodityOptions,
} from "@/actions/staticContentActions";
import { STATIC_CONTENT } from "@/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockState = {
  mineStatusOptions: Mock.STATUS_OPTIONS.options,
  mineRegionOptions: Mock.REGION_OPTIONS.options,
  mineTenureTypes: Mock.TENURE_TYPES.options,
  expectedDocumentStatusOptions: Mock.EXPECTED_DOCUMENT_STATUS_OPTIONS.options,
  mineTSFRequiredReports: Mock.MINE_TSF_REQUIRED_REPORTS_RESPONSE.required_documents,
  mineDisturbanceOptions: Mock.DISTURBANCE_OPTIONS.options,
  mineCommodityOptions: Mock.COMMODITY_OPTIONS.options,
};

describe("mineSelectors", () => {
  const { mineStatusOptions, mineDisturbanceOptions, mineCommodityOptions } = mockState;
  const { mineTSFRequiredReports } = mockState;
  let { mineRegionOptions, mineTenureTypes } = mockState;

  it("`getMineStatusOptions` calls `staticContentReducer.getMineStatusOptions`", () => {
    const storeAction = storeStatusOptions(Mock.STATUS_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineStatusOptions(localMockState)).toEqual(mineStatusOptions);
  });

  it("`getMineRegionOptions` calls `staticContentReducer.getMineRegionOptions`", () => {
    const storeAction = storeRegionOptions(Mock.REGION_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineRegionOptions(localMockState)).toEqual(mineRegionOptions);
  });

  it("`getMineTSFRequiredReports` calls `staticContentReducer.getMineTSFRequiredReports`", () => {
    const storeAction = storeMineTSFRequiredDocuments(Mock.MINE_TSF_REQUIRED_REPORTS_RESPONSE);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineTSFRequiredReports(localMockState)).toEqual(mineTSFRequiredReports);
  });

  it("`getMineRegionHash` converts `staticContentReducer.getMineRegionOptions`", () => {
    mineRegionOptions = Mock.REGION_OPTIONS.options;
    const selected = getMineRegionHash.resultFunc(mineRegionOptions);
    expect(selected).toEqual(Mock.REGION_HASH);
  });

  it("`getMineTenureTypesHash` converts `staticContentReducer.getMineTenureTypes`", () => {
    mineTenureTypes = Mock.TENURE_TYPES.options;
    const selected = getMineTenureTypesHash.resultFunc(mineTenureTypes);
    expect(selected).toEqual(Mock.TENURE_HASH);
  });

  it("`getMineTenureTypes` calls `staticContentReducer.getMineTenureTypes`", () => {
    const storeAction = storeTenureTypes(Mock.TENURE_TYPES);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineTenureTypes(localMockState)).toEqual(mineTenureTypes);
  });

  it("`getMineDisturbanceOptions` calls `staticContentReducer.getMineDisturbanceOptions`", () => {
    const storeAction = storeDisturbanceOptions(Mock.DISTURBANCE_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineDisturbanceOptions(localMockState)).toEqual(mineDisturbanceOptions);
  });

  it("`getMineCommodityOptions` calls `staticContentReducer.getMineCommodityOptions`", () => {
    const storeAction = storeCommodityOptions(Mock.COMMODITY_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getMineCommodityOptions(localMockState)).toEqual(mineCommodityOptions);
  });

  it("`getDropdownCommodityOptions` calls `staticContentReducer.getMineCommodityOptions`", () => {
    const storeAction = storeCommodityOptions(Mock.COMMODITY_OPTIONS);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    const mockDropdownCommodityOptions = Mock.DROPDOWN_COMMODITY_OPTIONS;
    expect(getDropdownCommodityOptions(localMockState)).toEqual(mockDropdownCommodityOptions);
  });
});

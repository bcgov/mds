import {
  staticContentReducer,
  getStaticContentLoadingIsComplete,
} from "@common/reducers/staticContentReducer";
import { storeBulkStaticContent } from "@common/actions/staticContentActions";
import { STATIC_CONTENT } from "@common/constants/reducerTypes";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  mineStatusOptions: [],
  mineRegionOptions: [],
  mineDisturbanceOptions: [],
  mineTenureTypes: [],
  mineCommodityOptions: [],
  provinceOptions: [],
  permitStatusCodes: [],
  complianceCodes: [],
  incidentFollowupActionOptions: [],
  incidentDeterminationOptions: [],
  incidentStatusCodeOptions: [],
  incidentCategoryCodeOptions: [],
  varianceStatusOptions: [],
  varianceDocumentCategoryOptions: [],
  mineReportCategoryOptions: [],
  mineReportDefinitionOptions: [],
  mineReportStatusOptions: [],
  partyRelationshipTypes: [],
  noticeOfWorkActivityTypeOptions: [],
  noticeOfWorkUnitTypeOptions: [],
  noticeOfWorkApplicationTypeOptions: [],
  noticeOfWorkApplicationStatusOptions: [],
  noticeOfWorkApplicationDocumentTypeOptions: [],
  noticeOfWorkUndergroundExplorationTypeOptions: [],
  noticeOfWorkApplicationProgressStatusCodeOptions: [],
  noticeOfWorkApplicationReviewOptions: [],
  noticeOfWorkApplicationPermitTypeOptions: [],
  bondStatusOptions: [],
  bondTypeOptions: [],
  bondDocumentTypeOptions: [],
  exemptionFeeStatusOptions: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("staticContentReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = staticContentReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_BULK_STATIC_CONTENT", () => {
    // const expectedValue = getBaseExpectedValue();
    const expectedValue = MOCK.BULK_STATIC_CONTENT_RESPONSE;
    const result = staticContentReducer(
      undefined,
      storeBulkStaticContent(MOCK.BULK_STATIC_CONTENT_RESPONSE)
    );
    expect(result).toEqual(expectedValue);
  });

  it("`STORE_BULK_STATIC_CONTENT marks static content as loaded", () => {
    const storeAction = storeBulkStaticContent({}, MOCK.BULK_STATIC_CONTENT_RESPONSE);
    const storeState = staticContentReducer({}, storeAction);
    const localMockState = {
      [STATIC_CONTENT]: storeState,
    };
    expect(getStaticContentLoadingIsComplete(localMockState)).toEqual(true);
  });
});

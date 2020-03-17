import { staticContentReducer } from "@common/reducers/staticContentReducer";
import { storeBulkStaticContent } from "@common/actions/staticContentActions";
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
  noticeOfWorkActivityTypeOptions: [],
  noticeOfWorkUnitTypeOptions: [],
  noticeOfWorkApplicationTypeOptions: [],
  noticeOfWorkApplicationStatusOptions: [],
  noticeOfWorkApplicationDocumentTypeOptions: [],
  noticeOfWorkUndergroundExplorationTypeOptions: [],
  noticeOfWorkApplicationProgressStatusCodeOptions: [],
  noticeOfWorkApplicationReviewOptions: [],
  noticeOfWorkApplicationPermitTypeOptions: [],
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
});

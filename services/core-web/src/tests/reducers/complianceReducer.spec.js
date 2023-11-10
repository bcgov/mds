import { complianceReducer } from "@mds/common/redux/reducers/complianceReducer";
import { storeMineComplianceInfo } from "@mds/common/redux/actions/complianceActions";

const baseExpectedValue = {
  mineComplianceInfo: {},
};

describe("complianceReducer", () => {
  it("receives undefined", () => {
    const expectedValue = baseExpectedValue;

    const result = complianceReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_MINE_COMPLIANCE_INFO", () => {
    const expectedValue = baseExpectedValue;
    expectedValue.mineComplianceInfo = {
      last_inspection: "2018-12-12 00:00",
      last_inspector: "test",
      open_orders: 5,
      overdue_orders: 5,
      advisories: 5,
      warnings: 5,
      section_35_orders: 5,
    };

    const result = complianceReducer(
      undefined,
      storeMineComplianceInfo({
        last_inspection: "2018-12-12 00:00",
        last_inspector: "test",
        open_orders: 5,
        overdue_orders: 5,
        advisories: 5,
        warnings: 5,
        section_35_orders: 5,
      })
    );
    expect(result).toEqual(expectedValue);
  });
});

import { explosivesPermitReducer } from "@mds/common/redux/reducers/explosivesPermitReducer";
import { storeExplosivesPermits } from "@mds/common/redux/actions/explosivesPermitActions";
import * as MOCK from "@/tests/mocks/dataMocks";

const baseExpectedValue = {
  explosivesPermits: [],
};

describe("explosivesPermitReducer", () => {
  it("receives undefined", () => {
    const expectedValue = baseExpectedValue;

    const result = explosivesPermitReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_EXPLOSIVES_PERMITS", () => {
    const expectedValue = baseExpectedValue;
    expectedValue.explosivesPermits = MOCK.EXPLOSIVES_PERMITS.data.records;

    const result = explosivesPermitReducer(
      undefined,
      storeExplosivesPermits(MOCK.EXPLOSIVES_PERMITS.data)
    );
    expect(result).toEqual(expectedValue);
  });
});

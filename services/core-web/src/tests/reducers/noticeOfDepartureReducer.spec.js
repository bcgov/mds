import * as Mocks from "@/tests/mocks/dataMocks";
import { noticeOfDepartureReducer } from "@common/reducers/noticeOfDepartureReducer";
import { storeNoticesOfDeparture } from "@common/actions/noticeOfDepartureActions";

const baseExpectedValue = {
  nods: [],
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("noticeOfDepartureReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    const result = noticeOfDepartureReducer(undefined, {});
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_NOTICES_OF_DEPARTURE", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.nods = Mocks.NOTICES_OF_DEPARTURE.records;
    const result = noticeOfDepartureReducer(
      undefined,
      storeNoticesOfDeparture(Mocks.NOTICES_OF_DEPARTURE)
    );
    expect(result).toEqual(expectedValue);
  });
});

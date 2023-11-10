import * as Mocks from "@/tests/mocks/dataMocks";
import { noticeOfDepartureReducer } from "@mds/common/redux/reducers/noticeOfDepartureReducer";
import {
  storeNoticesOfDeparture,
  storeNoticeOfDeparture,
} from "@mds/common/redux/actions/noticeOfDepartureActions";

const baseExpectedValue = {
  nods: [],
  noticeOfDeparture: {},
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

  it("receives STORE_NOTICE_OF_DEPARTURE", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.noticeOfDeparture = Mocks.NOTICE_OF_DEPARTURE_DETAILS;
    const result = noticeOfDepartureReducer(
      undefined,
      storeNoticeOfDeparture(Mocks.NOTICE_OF_DEPARTURE_DETAILS)
    );
    expect(result).toEqual(expectedValue);
  });
});

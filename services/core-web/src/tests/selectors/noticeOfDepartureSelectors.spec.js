import { getNoticesOfDeparture } from "@common/selectors/noticeOfDepartureSelectors";
import { storeNoticesOfDeparture } from "@common/actions/noticeOfDepartureActions";
import { noticeOfDepartureReducer } from "@common/reducers/noticeOfDepartureReducer";
import { NOTICES_OF_DEPARTURE } from "@common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockState = {
  noticesOfDeparture: Mock.NOTICES_OF_DEPARTURE.records,
};

describe("mineSelectors", () => {
  const { noticesOfDeparture } = mockState;

  it("`getNoticesOfDeparture` calls `noticeOfDepartureReducer.getNoticesOfDeparture`", () => {
    const storeAction = storeNoticesOfDeparture(Mock.NOTICES_OF_DEPARTURE);
    const storeState = noticeOfDepartureReducer({}, storeAction);
    const localMockState = {
      [NOTICES_OF_DEPARTURE]: storeState,
    };
    expect(getNoticesOfDeparture(localMockState)).toEqual(noticesOfDeparture);
  });
});

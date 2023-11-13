import {
  getNoticesOfDeparture,
  getNoticeOfDeparture,
} from "@mds/common/redux/selectors/noticeOfDepartureSelectors";
import {
  storeNoticesOfDeparture,
  storeNoticeOfDeparture,
} from "@mds/common/redux/actions/noticeOfDepartureActions";
import { noticeOfDepartureReducer } from "@mds/common/redux/reducers/noticeOfDepartureReducer";
import { NOTICES_OF_DEPARTURE } from "@mds/common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";

const mockState = {
  noticesOfDeparture: Mock.NOTICES_OF_DEPARTURE.records,
  noticeOfDeparture: Mock.NOTICE_OF_DEPARTURE_DETAILS,
};

describe("noticesOfDepartureSelector", () => {
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

describe("noticeOfDepartureSelector", () => {
  const { noticeOfDeparture } = mockState;

  it("`getNoticeOfDeparture` calls `noticeOfDepartureReducer.getNoticeOfDeparture`", () => {
    const storeAction = storeNoticeOfDeparture(Mock.NOTICE_OF_DEPARTURE_DETAILS);
    const storeState = noticeOfDepartureReducer({}, storeAction);
    const localMockState = {
      [NOTICES_OF_DEPARTURE]: storeState,
    };
    expect(getNoticeOfDeparture(localMockState)).toEqual(noticeOfDeparture);
  });
});

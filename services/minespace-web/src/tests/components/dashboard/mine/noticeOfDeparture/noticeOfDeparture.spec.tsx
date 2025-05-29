import React from "react";
import { shallow } from "enzyme";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { NoticeOfDeparture } from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDeparture";

const dispatchProps: any = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchPermits: jest.fn(() => Promise.resolve()),
  fetchNoticesOfDeparture: jest.fn(() => Promise.resolve()),
  createNoticeOfDeparture: jest.fn(),
};
const reducerProps: any = {
  mine: MOCK.MINES.mines[MOCK.MINES.mineIds[0]],
  permits: MOCK.PERMITS,
  nods: MOCK.NOTICES_OF_DEPARTURE.records,
  isAuthenticated: true,
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({ id: "abcde1234567", activeTab: "nods?nod=xyz1234567" }),
    useLocation: jest.fn().mockReturnValue({
      pathname: "/mine/notice-of-departure",
      search: "",
      hash: "",
      state: null,
      key: "5nvxpbdafa",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("NoticesOfDeparture", () => {
  it("renders properly", () => {
    const component = shallow(<NoticeOfDeparture {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});

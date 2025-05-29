import React from "react";
import { shallow } from "enzyme";
import { ReviewActivities } from "@/components/noticeOfWork/applications/review/ReviewActivities";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";

const reducerProps = {
  isViewMode: true,
  noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
  noticeOfWorkType: "COL",
  renderOriginalValues: jest.fn().mockReturnValue({ value: "N/A", edited: true }),
};

describe("ReviewActivities", () => {
  it("renders properly", () => {
    const component = shallow(<ReviewActivities {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});

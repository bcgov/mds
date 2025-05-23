import React from "react";
import { shallow } from "enzyme";
import { ReviewNOWApplication } from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";

const reducerProps = {
  isViewMode: true,
  noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
  reclamationSummary: NOW_MOCK.RECLAMATION_SUMMARY,
  renderOriginalValues: jest.fn().mockReturnValue({ value: "N/A", edited: true }),
  userRoles: { includes: () => { } },
};

describe("ReviewNOWApplication", () => {
  it("renders properly", () => {
    const component = shallow(<ReviewNOWApplication {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});

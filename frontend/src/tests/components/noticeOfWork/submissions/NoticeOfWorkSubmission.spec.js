import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkSubmission } from "@/components/noticeOfWork/submissions/NoticeOfWorkSubmission";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchNoticeOfWorkSubmission = jest.fn(() => Promise.resolve());
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.regionHash = MOCK.REGION_HASH;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("NoticeOfWorkSubmission", () => {
  it("renders properly", () => {
    const component = shallow(
      <NoticeOfWorkSubmission {...dispatchProps} {...reducerProps} match={{ params: { id: 1 } }} />
    );
    expect(component).toMatchSnapshot();
  });
});

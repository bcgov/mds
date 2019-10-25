import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkSubmission } from "@/components/noticeOfWork/submissions/NoticeOfWorkSubmission";
import * as MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchNoticeOfWorkSubmission = jest.fn(() => Promise.resolve());
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.noticeOfWork = MOCK.NOTICE_OF_WORK;
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

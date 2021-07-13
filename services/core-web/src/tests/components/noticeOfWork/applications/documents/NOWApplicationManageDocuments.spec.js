import React from "react";
import { shallow } from "enzyme";
import { NOWApplicationManageDocuments } from "@/components/noticeOfWork/applications/manageDocuments/NOWApplicationManageDocuments";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationReviews = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mineGuid = NOW_MOCK.NOTICE_OF_WORK.mineGuid;
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.isLoaded = true;
  reducerProps.noticeOfWorkReviews = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("NOWApplicationManageDocuments", () => {
  it("renders properly", () => {
    const component = shallow(
      <NOWApplicationManageDocuments {...dispatchProps} {...reducerProps} />
    );
    expect(component).toMatchSnapshot();
  });
});

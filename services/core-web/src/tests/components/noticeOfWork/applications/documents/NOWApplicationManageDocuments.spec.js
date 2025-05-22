import React from "react";
import { render } from "@testing-library/react";
import { NOWApplicationManageDocuments } from "@/components/noticeOfWork/applications/manageDocuments/NOWApplicationManageDocuments";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

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

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
}

describe("NOWApplicationManageDocuments", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <NOWApplicationManageDocuments {...dispatchProps} {...reducerProps} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});

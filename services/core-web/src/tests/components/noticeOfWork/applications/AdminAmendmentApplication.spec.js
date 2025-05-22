import React from "react";
import { render } from "@testing-library/react";
import { AdminAmendmentApplication } from "@/components/noticeOfWork/applications/AdminAmendmentApplication";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.renderTabTitle = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.history = { push: jest.fn(), location: { state: {} } };
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.applicationPageFromRoute = "mock/url";
  reducerProps.fixedTop = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
    originalNoticeOfWork: NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
}

describe("AdminAmendmentApplication", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <AdminAmendmentApplication
            {...dispatchProps}
            {...reducerProps}
            match={{ params: { id: 1, tab: "application" } }}
          />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});

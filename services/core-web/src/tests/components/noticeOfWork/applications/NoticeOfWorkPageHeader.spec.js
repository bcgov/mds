import React from "react";
import { render } from "@testing-library/react";
import { NoticeOfWorkPageHeader } from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.renderTabTitle = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.noticeOfWorkApplicationStatusOptionsHash = {};
  reducerProps.inspectorsHash = {};
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.applicationPageFromRoute = "mock/url";
  reducerProps.fixedTop = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("NoticeOfWorkPageHeader", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <NoticeOfWorkPageHeader
          {...dispatchProps}
          {...reducerProps}
          match={{ params: { id: 1, tab: "application" } }}
        />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});

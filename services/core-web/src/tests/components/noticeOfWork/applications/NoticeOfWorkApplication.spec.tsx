import React from "react";
import { render } from "@testing-library/react";
import { NoticeOfWorkApplication } from "@/components/noticeOfWork/applications/NoticeOfWorkApplication";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const dispatchProps: any = {
  renderTabTitle: jest.fn(),
};
const reducerProps: any = {
  match: {},
  history: { push: jest.fn(), location: { state: {} } },
  noticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  applicationPageFromRoute: "mock/url",
  fixedTop: false,
};

describe("NoticeOfWorkApplication", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper>
          <NoticeOfWorkApplication
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

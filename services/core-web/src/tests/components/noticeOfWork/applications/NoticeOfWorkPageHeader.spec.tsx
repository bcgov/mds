import React from "react";
import { render } from "@testing-library/react";
import { NoticeOfWorkPageHeader } from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  renderTabTitle: jest.fn(),
};
const reducerProps = {
  noticeOfWorkApplicationStatusOptionsHash: {},
  inspectorsHash: {},
  noticeOfWork: NOW_MOCK.NOTICE_OF_WORK,
  applicationPageFromRoute: { title: "Mock Title", route: "mock/url" },
  fixedTop: false,
};

describe("NoticeOfWorkPageHeader", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <NoticeOfWorkPageHeader
          {...dispatchProps}
          {...reducerProps}
        />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});

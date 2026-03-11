import React from "react";
import { render } from "@testing-library/react";
import { NoticeOfWorkPageHeader } from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  renderTabTitle: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
  updateNoticeOfWorkApplication: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
};
const reducerProps = {
  noticeOfWorkApplicationStatusOptionsHash: {},
  noticeOfWorkTierOptionsHash: {},
  inspectorsHash: {},
  noticeOfWork: NOW_MOCK.NOTICE_OF_WORK as any,
  applicationPageFromRoute: { title: "Mock Title", route: "mock/url" },
  fixedTop: false,
};

describe("NoticeOfWorkPageHeader", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <BrowserRouter>
          <NoticeOfWorkPageHeader
            {...dispatchProps}
            {...reducerProps}
          />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});

import React from "react";
import { render } from "@testing-library/react";
import { ScrollContentWrapper } from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import type { IimportedNOWApplication } from "@mds/common/interfaces/now/importedNOWApplication.interface";

const dispatchProps = {
  change: jest.fn(),
};
const props = {
  formValues: NOWMocks.IMPORTED_NOTICE_OF_WORK as unknown as IimportedNOWApplication,
  isLoaded: true,
  isViewMode: true,
  children: <></>,
  showContent: false,
  data: {},
  showActionsAndProgress: true,
  title: "Application Tab",
  id: "REV",
  history: { location: { state: { currentActiveLink: "mock link" } } },
  location: {
    pathname: "/mock-path",
    search: "",
    state: {},
    hash: "",
    key: "mock-key",
  },
  match: {
    params: {},
    isExact: true,
    path: "/mock-path",
    url: "/mock-url",
  },
};

describe("ScrollContentWrapper", () => {
  it("renders properly", () => {
    const { container: component } = render(<ScrollContentWrapper {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});

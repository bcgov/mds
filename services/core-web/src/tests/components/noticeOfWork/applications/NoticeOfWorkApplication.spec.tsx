import React from "react";
import { render } from "@testing-library/react";
import { NoticeOfWorkApplication } from "@/components/noticeOfWork/applications/NoticeOfWorkApplication";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { Feature } from "@mds/common/utils/featureFlag";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({ tab: "application" }),
  useHistory: jest.fn().mockReturnValue({ replace: jest.fn(), push: jest.fn(), location: { state: {} } }),
}));

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn().mockReturnValue({
    isFeatureEnabled: jest.fn().mockReturnValue(true),
  }),
}));

const dispatchProps: any = {
  renderTabTitle: jest.fn((title) => title),
};
const reducerProps: any = {
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
          />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });

  it("renders the Search Documents tab when feature flag is enabled", () => {
    const { useFeatureFlag } = require("@mds/common/providers/featureFlags/useFeatureFlag");
    useFeatureFlag.mockReturnValue({
      isFeatureEnabled: jest.fn().mockImplementation((feature) => feature === Feature.NOW_APPLICATION_DOCUMENT_SEARCH),
    });

    const { getByText } = render(
      <BrowserRouter>
        <ReduxWrapper>
          <NoticeOfWorkApplication
            {...dispatchProps}
            {...reducerProps}
          />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(getByText("Search Documents")).toBeInTheDocument();
  });
});

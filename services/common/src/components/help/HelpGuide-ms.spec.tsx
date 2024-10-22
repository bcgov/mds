import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import HelpGuide, { HelpGuideContent } from "./HelpGuide";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { SystemFlagEnum } from "@mds/common/constants";
import { MS_USER_ACCESS_DATA } from "@mds/common/tests/mocks/dataMocks";
import { helpReducerType } from "@mds/common/redux/slices/helpSlice";
import { BrowserRouter } from "react-router-dom";

const msState = {
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.ms,
    userAccessData: MS_USER_ACCESS_DATA,
    isAuthenticated: true,
  },
  [helpReducerType]: {
    helpGuides: {},
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      tab: "overview",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("HelpGuide", () => {
  it("renders MS properly with default content", async () => {
    const helpKey = "Not-Exists";
    const { findByTestId } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={msState}>
          <HelpGuide />
          <HelpGuideContent helpKey={helpKey} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    const helpButton = await findByTestId("help-open");
    fireEvent.click(helpButton);

    const helpContent = await findByTestId("help-content");

    expect(helpContent).toMatchSnapshot();
  });
});

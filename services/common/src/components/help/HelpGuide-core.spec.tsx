import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { HelpGuideContent } from "./HelpGuide";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { SystemFlagEnum } from "@mds/common/constants";
import { HELP_GUIDE_CORE, USER_ACCESS_DATA } from "@mds/common/tests/mocks/dataMocks";
import { EMPTY_HELP_KEY, helpReducerType } from "@mds/common/redux/slices/helpSlice";

const coreState = {
  [AUTHENTICATION]: {
    systemFlag: SystemFlagEnum.core,
    userAccessData: [...USER_ACCESS_DATA, "core_helpdesk"],
    isAuthenticated: true,
  },
  [helpReducerType]: {
    helpGuides: {
      [EMPTY_HELP_KEY]: HELP_GUIDE_CORE.default,
    },
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
  it("renders CORE properly", async () => {
    const helpKey = "Not-Exists";

    const { findByTestId, findByText } = render(
      <ReduxWrapper initialState={coreState}>
        <HelpGuideContent helpKey={helpKey} />
      </ReduxWrapper>
    );

    const helpButton = await findByTestId("help-open");
    fireEvent.click(helpButton);

    const defaultContent = await findByText("CORE default content");
    expect(defaultContent).toBeInTheDocument();

    const editButton = await findByText("Edit Help Guide");
    fireEvent.click(editButton);

    const helpContent = await findByTestId("help-content");
    expect(helpContent).toMatchSnapshot();
  });
});

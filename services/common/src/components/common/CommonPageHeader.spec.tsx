import React from "react";
import { render } from "@testing-library/react";
import CommonPageHeader from "./CommonPageHeader";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { MINES } from "@mds/common/constants/reducerTypes";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const initialState = {
  [MINES]: MOCK.MINES,
};

const defaultProps = {
  entityType: "Llama",
  entityLabel: "George",
  mineGuid: MOCK.MINES.mineIds[0],
  current_permittee: "Permit Holder",
  breadCrumbs: [
    { route: "https://example.com", text: "All Llamas" },
    { route: "https://example.com/specific", text: "Specific Llamas" },
  ],
  tabProps: {
    items: [{ key: "overview", label: "Overview", children: <div>Overview Content</div> }],
    defaultActiveKey: "overview",
  },
};

describe("CommonPageHeader", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <CommonPageHeader {...defaultProps} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });

  it("shows the additional mines button when additionalMines are provided", () => {
    const additionalMines = [
      { mine_guid: "abc-123", mine_name: "Mine Two" },
      { mine_guid: "def-456", mine_name: "Mine Three" },
    ];
    const { getByRole } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <CommonPageHeader {...defaultProps} additionalMines={additionalMines} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(getByRole("button", { name: /show 2 more associated mines/i })).toBeInTheDocument();
  });

  it("does not show the additional mines button when no additionalMines are provided", () => {
    const { queryByRole } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <CommonPageHeader {...defaultProps} />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(queryByRole("button", { name: /more associated mines/i })).not.toBeInTheDocument();
  });
});

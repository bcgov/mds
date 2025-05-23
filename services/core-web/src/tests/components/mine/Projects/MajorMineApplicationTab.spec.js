import React from "react";
import { render } from "@testing-library/react";
import MajorMineApplicationTab from "@/components/mine/Projects/MajorMineApplicationTab";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PROJECTS } from "@mds/common/constants/reducerTypes";

const props = {
  project: MOCK.PROJECT,
  majorMineAppStatusCodesHash: MOCK.MAJOR_MINES_APPLICATION_STATUS_CODES_HASH,
  fetchProjectById: jest.fn(() => Promise.resolve()),
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      projectGuid: "35633148-57f8-4967-be35-7f89abfbd02e",
      tab: "app",
    }),
    useLocation: jest.fn().mockReturnValue({
      hash: ""
    }),
    useHistory: jest.fn().mockReturnValue({
      action: ""
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

const initialState = {
  [PROJECTS]: {
    project: MOCK.PROJECT
  }
};

describe("MajorMineApplicationTab", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper initialState={initialState}>
        <MajorMineApplicationTab {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});

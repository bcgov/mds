import React from "react";
import ProjectStartPage from "@/components/dashboard/mine/projects/ProjectStartPage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { MINES } from "@mds/common/constants/reducerTypes";
import { BrowserRouter } from "react-router-dom";

const mineGuid = "35633148-57f8-4967-be35-7f89abfbd02e";

const initialState = {
  [MINES]: {
    ...MOCK.MINES,
    mineIds: [mineGuid],
    mines: {
      [mineGuid]: {
        ...MOCK.MINES.mines[Object.keys(MOCK.MINES.mines)[0]],
        mine_guid: mineGuid,
      },
    },
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
    }),
    useParams: jest.fn().mockReturnValue({
      mineGuid: "35633148-57f8-4967-be35-7f89abfbd02e",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

describe("ProjectStartPage", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <ProjectStartPage />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});

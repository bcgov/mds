import React from "react";
import { render } from "@testing-library/react";
import { MajorMineApplicationPage } from "@/components/pages/Project/MajorMineApplicationPage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PROJECTS } from "@mds/common/constants/reducerTypes";
import { BrowserRouter } from "react-router-dom";

const initialState = {
  [PROJECTS]: {
    project: MOCK.PROJECT,
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      projectGuid: "35633148-57f8-4967-be35-7f89abfbd02e",
    }),
    useLocation: jest.fn().mockReturnValue({
      state: { current: 1 },
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

jest.mock("@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm", () => {
  return () => <div data-testid="mma-form">Major Mine Application Form</div>;
});

describe("MajorMinesApplicationPage", () => {
  it("renders properly", async () => {
    const { container, findByTestId } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <MajorMineApplicationPage />
        </ReduxWrapper>
      </BrowserRouter>
    );
    const mmaForm = await findByTestId("mma-form");
    expect(mmaForm).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });
});

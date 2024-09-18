import React from "react";
import { render } from "@testing-library/react";
import { MajorMineApplicationReviewSubmit } from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationReviewSubmit";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { PROJECTS } from "@mds/common/constants/reducerTypes";

const initialState = {
  [PROJECTS]: {
    project: MOCK.PROJECT,
    majorMinesApplication: MOCK.PROJECT.major_mine_application,
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useLocation: jest.fn().mockReturnValue({
      state: {
        // for the first test, MajorMineApplicationPage
        applicationSubmitted: true,
      },
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

describe("MajorMineApplicationReviewSubmit", () => {
  test("renders properly as on MajorMineApplicationPage", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <MajorMineApplicationReviewSubmit
          toggleConfirmedSubmission={() => {}}
          confirmedSubmission={false}
          project={MOCK.PROJECT}
          refreshData={() => Promise.resolve()}
        />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });

  test("renders properly as on ProjectPage", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <MajorMineApplicationReviewSubmit
          project={MOCK.PROJECT}
          applicationSubmitted
          tabbedView
          refreshData={() => Promise.resolve()}
        />
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});

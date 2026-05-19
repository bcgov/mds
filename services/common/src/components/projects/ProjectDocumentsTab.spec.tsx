import React from "react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { render } from "@testing-library/react";
import { AUTHENTICATION, PROJECTS } from "@mds/common/constants/reducerTypes";
import ProjectDocumentsTab from "./ProjectDocumentsTab";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { amsAppReducerType } from "@mds/common/redux/slices/amsFinalApplicationSlice";
import { USER_ROLES } from "@mds/common/constants/environment";

const initialState = {
  [PROJECTS]: { projects: MOCK.PROJECTS.records, project: MOCK.PROJECT },
  [amsAppReducerType]: {
    amsFinalApplications: {
      [MOCK.AMS_FINAL_APPLICATION.project_summary_authorization_guid]: MOCK.AMS_FINAL_APPLICATION,
    }
  }
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      tab: "",
    }),
    useLocation: jest.fn().mockReturnValue({
      hash: "",
    }),
    useHistory: jest.fn().mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      location: { hash: "" },
    }),
  };
}
jest.mock("react-router-dom", () => mockFunction());

describe("ProjectDocumentsTab", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <ProjectDocumentsTab project={MOCK.PROJECT} />
      </ReduxWrapper>
    );

    expect(container).toMatchSnapshot();
  });

  it("renders with canEditMajorMineApplications and isUserProponent roles set", () => {
    const stateWithRoles = {
      ...initialState,
      [AUTHENTICATION]: {
        userAccessData: [USER_ROLES.role_edit_major_mine_applications],
        isProponent: true,
        userInfo: {},
      },
    };
    const { container } = render(
      <ReduxWrapper initialState={stateWithRoles}>
        <ProjectDocumentsTab project={MOCK.PROJECT} />
      </ReduxWrapper>
    );
    expect(container).toBeDefined();
  });
});

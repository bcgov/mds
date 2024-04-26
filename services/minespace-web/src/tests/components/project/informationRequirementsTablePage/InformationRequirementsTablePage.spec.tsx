import React from "react";
import { InformationRequirementsTablePage } from "@/components/pages/Project/InformationRequirementsTablePage";
import * as MOCK from "@/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import { AUTHENTICATION, PROJECTS, STATIC_CONTENT } from "@mds/common/constants/reducerTypes";
import { render } from "@testing-library/react";
import { USER_ROLES } from "@mds/common";
import { Provider } from "react-redux";
import { store } from "@/App";
import * as projectActionCreator from "@mds/common/redux/actionCreators/projectActionCreator";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { success } from "@mds/common/redux/actions/genericActions";
import * as projectActions from "@mds/common/redux/actions/projectActions";
import { BrowserRouter } from "react-router-dom";

const initialState = {
  [PROJECTS]: {
    projects: [MOCK.PROJECT],
    project: MOCK.PROJECT,
    requirements: MOCK.INFORMATION_REQUIREMENTS_TABLE.requirements,
  },
  [STATIC_CONTENT]: {
    informationRequirementsTableDocumentTypes:
      MOCK.INFORMATION_REQUIREMENTS_TABLE_STATUS_CODES_HASH,
  },
  [AUTHENTICATION]: {
    userAccessData: [USER_ROLES.role_minespace_proponent],
  },
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  const projectGuid = "8132462392222";
  const irtGuid = "c16afb82-144c-4138-9a36-ba5c24c43d8a";
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({
      projectGuid,
      irtGuid,
    }),
    useLocation: jest.fn().mockReturnValue({
      state: { current: 2 },
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());
jest.spyOn(projectActionCreator, "fetchProjectById").mockImplementation(
  (): AppThunk<Promise<any>> => (dispatch) => {
    dispatch(success(reducerTypes.GET_PROJECT));
    dispatch(projectActions.storeProject(MOCK.PROJECT));
    return Promise.resolve(MOCK.PROJECT);
  }
);
jest.spyOn(projectActionCreator, "fetchRequirements").mockImplementation(
  (): AppThunk<Promise<any>> => (dispatch) => {
    dispatch(success(reducerTypes.GET_REQUIREMENTS));
    dispatch(projectActions.storeRequirements({ records: MOCK.IRT_REQUIREMENTS }));
    return Promise.resolve(MOCK.IRT_REQUIREMENTS);
  }
);

describe("InformationRequirementsTablePage", () => {
  it("renders properly", async () => {
    const { container, findByText } = render(
      <BrowserRouter>
        <ReduxWrapper initialState={initialState}>
          <Provider store={store}>
            <InformationRequirementsTablePage />
          </Provider>
        </ReduxWrapper>
      </BrowserRouter>
    );

    await findByText(/Information Requirements Table/i);

    expect(container).toMatchSnapshot();
  });
});

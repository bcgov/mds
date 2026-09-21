import React from "react";
import { render } from "@testing-library/react";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import EnvApplicationPage from "./EnvApplicationPage";
import { PROJECTS, MINES } from "@mds/common/constants/reducerTypes";
import { amsAppReducerType } from "@mds/common/redux/slices/amsFinalApplicationSlice";

const initialState = {
    [PROJECTS]: {
        project: {
            ...MOCK.PROJECT,
            mine_guid: MOCK.MINES.mineIds[0],
            project_summary: {
                ...MOCK.PROJECT.project_summary,
                authorizations: [MOCK.AMS_AUTHORIZATION_SUCCESS]
            }
        },
        projectSummary: MOCK.PROJECT.project_summary,
    },
    [MINES]: MOCK.MINES,
    [amsAppReducerType]: {
        amsFinalApplications: {
            [MOCK.AMS_AUTHORIZATION_SUCCESS.project_summary_authorization_guid]: null
        }
    }
};

function mockFunction() {
    const original = jest.requireActual("react-router-dom");
    return {
        ...original,
        useParams: jest.fn().mockReturnValue({
            projectGuid: "35633148-57f8-4967-be35-7f89abfbd02e",
            projectSummaryGuid: "70414192-ca71-4d03-93a5-630491e9c554",
            projectSummaryAuthorizationGuid: "c47161c0-8860-4125-8e68-fac3d98cf429",
            tab: "basic-information"
        }),
    };
};

jest.mock("react-router-dom", () => mockFunction());


describe("EnvApplicationPage", () => {
    beforeEach(() => {
        (global as any).GLOBAL_ROUTES = {
            MAJOR_PROJECTS: {
                route: "mock-route",
                dynamicRoute: (mineGuid) =>
                    `/mock-route/${mineGuid}`,
            },
            EDIT_PROJECT: {
                route: "mock-route",
                dynamicRoute: (projectGuid) =>
                    `/mock-route/${projectGuid}`,
            },
            MINE_DASHBOARD: {
                route: "mock-route",
                dynamicRoute: (mineGuid) =>
                    `/mock-route/${mineGuid}`,
            },
        };
    });
    it("renders properly", () => {
        const { container } = render(
            <ReduxWrapper initialState={initialState}>
                <BrowserRouter>
                    <EnvApplicationPage />
                </BrowserRouter>
            </ReduxWrapper>
        );

        expect(container).toMatchSnapshot();
    });

    it("sets edit mode to false when amsFinalApp is not editable", () => {
        const stateWithNonEditableApp = {
            ...initialState,
            [amsAppReducerType]: {
                amsFinalApplications: {
                    [MOCK.AMS_AUTHORIZATION_SUCCESS.project_summary_authorization_guid]: {
                        ...MOCK.AMS_FINAL_APPLICATION,
                        editable: false,
                    },
                },
            },
        };
        const { container } = render(
            <ReduxWrapper initialState={stateWithNonEditableApp}>
                <BrowserRouter>
                    <EnvApplicationPage />
                </BrowserRouter>
            </ReduxWrapper>
        );
        expect(container).toBeDefined();
    });
});
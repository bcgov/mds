import { configureStore } from "@reduxjs/toolkit";
import amsFinalAppReducer, {
    getAmsFinalApps,
    getAmsFinalAppByAuthGuid,
    getAmsFinalAppsByProjectSummary,
    getAmsFinalAppIsLoaded,
    createAmsFinalApp,
    updateAmsFinalApp,
    fetchAmsFinalApp,
    fetchAmsFinalAppsByProjectSummary,
    amsAppReducerType
} from "./amsFinalApplicationSlice";
import CustomAxios from "../customAxios";
import { IAmsFinalApplication } from "@mds/common/interfaces/projects/amsFinalApplication.interface";

const showLoadingMock = jest.fn().mockReturnValue({ type: "SHOW_LOADING", payload: { show: true } });
const hideLoadingMock = jest.fn().mockReturnValue({ type: "HIDE_LOADING", payload: { show: false } });

jest.mock("@mds/common/redux/customAxios");
jest.mock("react-redux-loading-bar", () => ({
    showLoading: () => showLoadingMock,
    hideLoading: () => hideLoadingMock,
}));

describe("amsFinalApplicationSlice", () => {
    let store;
    const projectSummaryGuid = "project-summary-guid";
    const projectSummaryAuthorizationGuid = "auth-guid";
    const amsFinalApplicationGuid = "ams-final-application-guid";

    const application: Partial<IAmsFinalApplication> = {
        project_summary_authorization_guid: projectSummaryAuthorizationGuid,
        submitter_name: "Jane Doe",
        is_agent: false,
        is_draft: true,
        pre_submitted_files: [],
        submitted_timestamp: null,
        documents: []
    };

    const newApplicationResponse: IAmsFinalApplication = {
        ams_final_application_guid: amsFinalApplicationGuid,
        project_summary_authorization_guid: projectSummaryAuthorizationGuid,
        project_summary_guid: projectSummaryGuid,
        submitter_name: "Jane Doe",
        is_agent: false,
        is_draft: false,
        pre_submitted_files: ["DFF"],
        submitted_timestamp: "2025-06-25T12:00:00Z",
        documents: [
            {
                ams_final_application_document_xref_guid: "doc-xref-guid-1",
                ams_final_application_guid: "ams-guid-1",
                ams_final_application_document_type_code: "AID",
                document_type_description: "Type 1",
                document_manager_guid: "doc-mgr-guid-1",
                mine_document_guid: "mine-doc-guid-1",
                mine_guid: "mine-guid-1",
                document_name: "doc1.pdf",
                upload_date: "2025-06-25T12:00:00Z",
                create_user: "Jane Doe",
            }
        ]
    };
    beforeEach(() => {
        store = configureStore({
            reducer: {
                [amsAppReducerType]: amsFinalAppReducer
            }
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("selectors", () => {
        it("should return empty initially", () => {
            const state = store.getState();
            expect(getAmsFinalApps({ [amsAppReducerType]: state[amsAppReducerType] })).toEqual({});
        });
    });

    describe("createAmsFinalApp", () => {
        it("should create a new application and store it", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockResolvedValue({ data: newApplicationResponse }),
            }));
            await store.dispatch(createAmsFinalApp({
                projectSummaryGuid,
                projectSummaryAuthorizationGuid,
                application
            }));
            const state = store.getState()[amsAppReducerType];
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);
            expect(getAmsFinalApps({ [amsAppReducerType]: state })).toEqual({
                [projectSummaryAuthorizationGuid]: newApplicationResponse
            });
        });
    });

    describe("updateAmsFinalApp", () => {
        it("should update an application and store it", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                put: jest.fn().mockResolvedValue({ data: newApplicationResponse }),
            }));
            await store.dispatch(updateAmsFinalApp({
                projectSummaryGuid,
                projectSummaryAuthorizationGuid,
                application
            }));
            const state = store.getState()[amsAppReducerType];
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);
            expect(getAmsFinalApps({ [amsAppReducerType]: state })).toEqual({
                [projectSummaryAuthorizationGuid]: newApplicationResponse
            });
        });
    });

    describe("fetchAmsFinalApp", () => {
        it("should fetch and store the application", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue({ data: { records: [newApplicationResponse] } }),
            }));
            await store.dispatch(fetchAmsFinalApp({
                projectSummaryGuid,
                projectSummaryAuthorizationGuid
            }));
            const state = store.getState()[amsAppReducerType];
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);
            expect(getAmsFinalApps({ [amsAppReducerType]: state })).toEqual({
                [projectSummaryAuthorizationGuid]: newApplicationResponse
            });
        });
        it("should store null if no records returned", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue({ data: { records: [] } }),
            }));
            await store.dispatch(fetchAmsFinalApp({
                projectSummaryGuid,
                projectSummaryAuthorizationGuid
            }));
            const state = store.getState()[amsAppReducerType];
            expect(getAmsFinalApps({ [amsAppReducerType]: state })).toEqual({
                [projectSummaryAuthorizationGuid]: null
            });
        });
    });

    describe("getAmsFinalAppByAuthGuid", () => {
        it("should select the application by auth guid", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue({ data: { records: [newApplicationResponse] } }),
            }));
            await store.dispatch(fetchAmsFinalApp({
                projectSummaryGuid,
                projectSummaryAuthorizationGuid
            }));
            const state = store.getState();
            expect(getAmsFinalAppByAuthGuid(projectSummaryAuthorizationGuid)(state)).toEqual(newApplicationResponse);
        });
    });

    describe("getAmsFinalAppIsLoaded", () => {
        describe("fetchAmsFinalAppsByProjectSummary", () => {
            it("should fetch and store all applications for a project summary", async () => {
                const anotherAuthGuid = "auth-guid-2";
                const anotherApp = {
                    ...newApplicationResponse,
                    project_summary_authorization_guid: anotherAuthGuid,
                    project_summary_guid: projectSummaryGuid,
                    submitter_name: "John Smith"
                };
                (CustomAxios as jest.Mock).mockImplementation(() => ({
                    get: jest.fn().mockResolvedValue({ data: { records: [newApplicationResponse, anotherApp] } }),
                }));
                await store.dispatch(
                    fetchAmsFinalAppsByProjectSummary(projectSummaryGuid)
                );
                const state = store.getState()[amsAppReducerType];
                expect(state.amsFinalApplications[projectSummaryAuthorizationGuid]).toEqual(newApplicationResponse);
                expect(state.amsFinalApplications[anotherAuthGuid]).toEqual(anotherApp);
            });
        });

        describe("getAmsFinalAppsByProjectSummary", () => {
            it("should select all applications for a given project summary guid", async () => {
                const anotherAuthGuid = "auth-guid-2";
                const anotherApp = {
                    ...newApplicationResponse,
                    project_summary_authorization_guid: anotherAuthGuid,
                    project_summary_guid: projectSummaryGuid,
                    submitter_name: "John Smith"
                };
                (CustomAxios as jest.Mock).mockImplementation(() => ({
                    get: jest.fn().mockResolvedValue({ data: { records: [newApplicationResponse, anotherApp] } }),
                }));
                await store.dispatch(
                    fetchAmsFinalAppsByProjectSummary(projectSummaryGuid)
                );
                const state = store.getState();
                const selector = getAmsFinalAppsByProjectSummary(projectSummaryGuid);
                const result = selector(state);
                expect(result).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ project_summary_authorization_guid: projectSummaryAuthorizationGuid }),
                        expect.objectContaining({ project_summary_authorization_guid: anotherAuthGuid })
                    ])
                );
            });
            it("should return an empty array if no project summary guid is provided", () => {
                const state = store.getState();
                const selector = getAmsFinalAppsByProjectSummary("");
                expect(selector(state)).toEqual([]);
            });
        });
        it("should return true if app is loaded", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue({ data: { records: [newApplicationResponse] } }),
            }));
            await store.dispatch(fetchAmsFinalApp({
                projectSummaryGuid,
                projectSummaryAuthorizationGuid
            }));
            const state = store.getState();
            expect(getAmsFinalAppIsLoaded(projectSummaryAuthorizationGuid)(state)).toBe(true);
        });
        it("should return false if app is not loaded", () => {
            const state = store.getState();
            expect(getAmsFinalAppIsLoaded("not-present-guid")(state)).toBe(false);
        });
        it("should return true if app is loaded as null (non-existant final application)", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue({ data: { records: [] } }),
            }));
            await store.dispatch(fetchAmsFinalApp({
                projectSummaryGuid,
                projectSummaryAuthorizationGuid
            }));
            const state = store.getState();
            expect(getAmsFinalAppIsLoaded(projectSummaryAuthorizationGuid)(state)).toBe(true);
        });
    });
});

import {
    deleteMineReportPermitRequirement,
    updateMineReportPermitRequirement,
    mineReportPermitRequirementReducer
} from "./mineReportPermitRequirementSlice";
import CustomAxios from "@mds/common/redux/customAxios";
import { configureStore } from "@reduxjs/toolkit";

const showLoadingMock = jest
    .fn()
    .mockReturnValue({ type: "SHOW_LOADING", payload: { show: true } });
const hideLoadingMock = jest
    .fn()
    .mockReturnValue({ type: "HIDE_LOADING", payload: { show: false } });
const notificationSuccessMock = jest.fn();

jest.mock("@mds/common/redux/customAxios");
jest.mock("react-redux-loading-bar", () => ({
    showLoading: () => showLoadingMock,
    hideLoading: () => hideLoadingMock,
}));

describe("mineReportPermitRequirementSlice", () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                mineReportPermitRequirement: mineReportPermitRequirementReducer,
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("deleteMineReportPermitRequirement", () => {
        const mockResponse = {
            data: "",
            status: 204,
        };

        it("should successfully delete a report requirement", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                delete: jest.fn().mockResolvedValue(mockResponse),
            }));

            const payload = {
                mineGuid: "f13d66db-8096-4e4b-85b8-6e0d231549fb",
                mine_report_permit_requirement_id: 5,
            };

            const response = await store.dispatch(deleteMineReportPermitRequirement(payload));

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            expect(response.status === 204);
            expect(CustomAxios).toHaveBeenCalledWith({
                errorToastMessage: "default",
                successToastMessage: "Successfully deleted report requirement",
            });
        });

        it("should handle API error when deleting a report requirement", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockRejectedValue(error),
            }));

            const payload = {
                mineGuid: "f13d66db-8096-4e4b-85b8-6e0d231549fb",
                mine_report_permit_requirement_id: 5,
            };

            await store.dispatch(deleteMineReportPermitRequirement(payload));

            expect(notificationSuccessMock).not.toHaveBeenCalled();
        });
    });

    describe("updateMineReportPermitRequirement", () => {
        const mockResponse = {
            data: {
                report_name: null,
                mine_report_permit_requirement_id: 5,
                due_date_period_months: 6,
                initial_due_date: null,
                cim_or_cpo: "BOTH",
                ministry_recipient: ["RO"],
                permit_condition_id: 37815,
            },
        };

        it("should successfully update a report requirement", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                put: jest.fn().mockResolvedValue(mockResponse),
            }));

            const payload = {
                mineGuid: "5b415b64-58af-434b-8636-960d98e0654f",
                values: {
                    report_name: null,
                    mine_report_permit_requirement_id: 5,
                    due_date_period_months: 6,
                    initial_due_date: null,
                    cim_or_cpo: "BOTH",
                    ministry_recipient: ["RO"],
                    permit_condition_id: 37815,
                    stepPath: "test",
                    permit_amendment_id: 7551
                }
            };

            const response = await store.dispatch(updateMineReportPermitRequirement(payload));

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            expect(response.status === 200);
            expect(response.mine_report_permit_requirement_id === 5);
            expect(response.permit_condition_id === 37815);

            expect(CustomAxios).toHaveBeenCalledWith({
                errorToastMessage: "default",
                successToastMessage: "Successfully updated report requirement",
            });
        });

        it("should handle API error when updating a report requirement", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                put: jest.fn().mockRejectedValue(error),
            }));

            const payload = {
                mineGuid: "5b415b64-58af-434b-8636-960d98e0654f",
                values: {
                    report_name: null,
                    mine_report_permit_requirement_id: 5,
                    due_date_period_months: 6,
                    initial_due_date: null,
                    cim_or_cpo: "BOTH",
                    ministry_recipient: ["RO"],
                    permit_condition_id: 37815,
                    stepPath: "test",
                    permit_amendment_id: 7551
                }
            };

            await store.dispatch(updateMineReportPermitRequirement(payload));

            expect(notificationSuccessMock).not.toHaveBeenCalled();
        });
    });
});

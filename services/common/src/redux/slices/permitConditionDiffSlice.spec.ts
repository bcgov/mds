import { fetchPermitConditionDiff, getPermitConditionDiff, IPermitConditionDiffState } from "./permitConditionDiffSlice";
import { configureStore } from "@reduxjs/toolkit";
import CustomAxios from "../customAxios";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { MINE } from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import { IPermitConditionChangeType, IPermitConditionComparison } from "@mds/common/interfaces/permits";

jest.mock("../customAxios");
jest.mock("../utils/RequestHeaders");

describe("permitConditionDiffSlice", () => {
    const mockStore = configureStore({
        reducer: {
            permitConditionDiff: (state = { diffs: {}, isLoading: false }, action) => state
        }
    });

    const mockAxios = {
        get: jest.fn()
    };

    const mockParams = {
        mineGuid: "test-mine-guid",
        permitGuid: "test-permit-guid",
        amendmentGuid: "test-amendment-guid"
    };

    const mockResponse: { data: { comparison: IPermitConditionComparison[] } } = {
        data: {
            comparison: [{
                previous_condition_guid: "test-previous-condition-guid",
                text_similarity: 0.5,
                structure_similarity: 0.5,
                combined_score: 0.5,
                change_type: IPermitConditionChangeType.ADDED
            }]
        }
    };
    beforeEach(() => {
        (CustomAxios as jest.Mock).mockReturnValue(mockAxios);
        (createRequestHeader as jest.Mock).mockReturnValue({ headers: {} });
        mockAxios.get.mockResolvedValue(mockResponse);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("fetchPermitConditionDiff", () => {
        it("should make API call with correct parameters", async () => {
            await mockStore.dispatch(fetchPermitConditionDiff(mockParams));

            expect(mockAxios.get).toHaveBeenCalledWith(
                `${ENVIRONMENT.apiUrl}${MINE}/${mockParams.mineGuid}/permits/${mockParams.permitGuid}/amendments/${mockParams.amendmentGuid}/diff`,
                { headers: {} }
            );
        });

        it("should handle successful API response", async () => {
            const result = await mockStore.dispatch(fetchPermitConditionDiff(mockParams));

            expect(result.payload).toEqual({
                key: mockParams.amendmentGuid,
                data: mockResponse.data.comparison
            });
        });

        it("should handle API error", async () => {
            const error = new Error("API Error");
            mockAxios.get.mockRejectedValue(error);

            const res = await mockStore.dispatch(fetchPermitConditionDiff(mockParams));
            expect(res.error?.message).toBe("API Error");
        });
    });

    describe("getPermitConditionDiff selector", () => {
        it("should return diff data for given amendmentGuid", () => {
            const state = {
                permitConditionDiff: {
                    diffs: {
                        "test-amendment-guid": mockResponse.data.comparison
                    },
                    isLoading: false
                }
            };

            const result = getPermitConditionDiff(state, "test-amendment-guid");
            expect(result).toEqual(mockResponse.data.comparison);
        });

        it("should return undefined for non-existent amendmentGuid", () => {
            const state = {
                permitConditionDiff: {
                    diffs: {},
                    isLoading: false
                }
            };

            const result = getPermitConditionDiff(state, "non-existent-guid");
            expect(result).toBeUndefined();
        });
    });
});
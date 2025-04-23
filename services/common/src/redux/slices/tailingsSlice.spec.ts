import { configureStore } from "@reduxjs/toolkit";
import tailingsReducer, {
    storeTsf,
    createTailingsStorageFacility,
    updateTailingsStorageFacility,
    fetchTailingsStorageFacility,
    fetchTsfsByMineGuid,
    getTsfsByMineGuid,
    getTsfByGuid,
    tsfReducerType,
} from "./tailingsSlice";
import { TSF } from "@mds/common/tests/mocks/dataMocks";
import CustomAxios from "../customAxios";
import { ICreateTailingsStorageFacility, ITailingsStorageFacility } from "@mds/common/interfaces";
import { ConsequenceClassificationStatusCodeEnum, FacilityTypeEnum, ITRBExemptionStatusCodeEnum, StorageLocationEnum, TailingsStorageFacilityTypeEnum, TSFOperatingStatusCodeEnum } from "@mds/common/constants/enums";

const showLoadingMock = jest
    .fn()
    .mockReturnValue({ type: "SHOW_LOADING", payload: { show: true } });
const hideLoadingMock = jest
    .fn()
    .mockReturnValue({ type: "HIDE_LOADING", payload: { show: false } });

jest.mock("@mds/common/redux/customAxios");
jest.mock("react-redux-loading-bar", () => ({
    showLoading: () => showLoadingMock,
    hideLoading: () => hideLoadingMock,
}));

const tsfGuid = TSF.mine_tailings_storage_facility_guid;
const mineGuid = TSF.mine_guid;

const newTsf: ICreateTailingsStorageFacility = {
    mine_guid: TSF.mine_guid,
    mine_tailings_storage_facility_name: "Brand New TSF",
    longitude: 49.123,
    latitude: -117.456,
    consequence_classification_status_code: ConsequenceClassificationStatusCodeEnum.LOW,
    itrb_exemption_status_code: ITRBExemptionStatusCodeEnum.NO,
    tsf_operating_status_code: TSFOperatingStatusCodeEnum.CLO,
    facility_type: FacilityTypeEnum.tailings_storage_facility,
    tailings_storage_facility_type: TailingsStorageFacilityTypeEnum.conventional,
    storage_location: StorageLocationEnum.above_ground,
    mines_act_permit_no: "MX-12345",
};
const new_tsf_guid = "new_tsf_guid";

describe('tailingsSlice', () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                [tsfReducerType]: tailingsReducer
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("storeTsf/getTsfByGuid", () => {
        it("should store the tsf in the state and retrieve it correctly", async () => {
            await store.dispatch(storeTsf(TSF));
            const state = store.getState();

            expect(getTsfByGuid(mineGuid, tsfGuid)(state)).toEqual(TSF);
        });
    });

    describe("createTailingsStorageFacility/getTsfsByMineGuid", () => {
        it("should create tsf successfully and be able to retrieve from the state by the mine guid", async () => {
            await store.dispatch(storeTsf(TSF));

            const newTsfResp = { ...newTsf, mine_tailings_storage_facility_guid: new_tsf_guid };
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockResolvedValue(newTsfResp),
            }));

            await store.dispatch(createTailingsStorageFacility(newTsf));
            const state = store.getState()[tsfReducerType];

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            const actualState = getTsfsByMineGuid(mineGuid)({ [tsfReducerType]: state });
            expect(actualState).toHaveLength(2);
            expect(actualState).toContainEqual(TSF);
            expect(actualState).toContainEqual(newTsfResp);

        });
        it("should handle API error", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(createTailingsStorageFacility(newTsf));
            const state = store.getState()[tsfReducerType];

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            expect(getTsfsByMineGuid(mineGuid)({ [tsfReducerType]: state })).toBeUndefined();

        });

    });

    describe("updateTailingsStorageFacility", () => {
        it("should update tsf successfully", async () => {

            (CustomAxios as jest.Mock).mockImplementation(() => ({
                put: jest.fn().mockResolvedValue({ data: TSF }),
            }));

            await store.dispatch(updateTailingsStorageFacility(TSF));
            const state = store.getState()[tsfReducerType];

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            expect(getTsfByGuid(mineGuid, tsfGuid)({ [tsfReducerType]: state })).toEqual(TSF);

        });
        it("should handle API error", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                put: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(updateTailingsStorageFacility(TSF));
            const state = store.getState()[tsfReducerType];

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            expect(getTsfByGuid(mineGuid, tsfGuid)({ [tsfReducerType]: state })).toBeNull();

        });
    });

    describe("fetchTailingsStorageFacility", () => {
        it("should fetch tsf successfully", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue({ data: TSF }),
            }));

            await store.dispatch(fetchTailingsStorageFacility({ mineGuid, tsfGuid }));
            const state = store.getState()[tsfReducerType];

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            expect(getTsfByGuid(mineGuid, tsfGuid)({ [tsfReducerType]: state })).toEqual(TSF);
        });
        it("should handle API error", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(fetchTailingsStorageFacility({ mineGuid, tsfGuid }));
            const state = store.getState()[tsfReducerType];

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            expect(getTsfByGuid(mineGuid, tsfGuid)({ [tsfReducerType]: state })).toBeNull();

        });
    });

    describe("fetchTsfsByMineGuid/getTsfsByMineGuid", () => {
        it("should fetch all mine tsfs successfully and retrieve them", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue({
                    data: {
                        mine_tailings_storage_facilities: [TSF, newTsf]
                    }
                }),
            }));

            await store.dispatch(fetchTsfsByMineGuid(mineGuid));
            const state = store.getState()[tsfReducerType];

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            const actualState = getTsfsByMineGuid(mineGuid)({ [tsfReducerType]: state });
            expect(actualState).toHaveLength(2);
            expect(actualState).toContainEqual(TSF);
            expect(actualState).toContainEqual(newTsf);

        });
        it("should handle API error", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(fetchTsfsByMineGuid(mineGuid));
            const state = store.getState()[tsfReducerType];

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            expect(getTsfsByMineGuid(mineGuid)({ [tsfReducerType]: state })).toBeUndefined();

        });
    });

    describe("getTsfsByMineGuid", () => {
        it("should not return any tsfs not matching the mine", async () => {
            const other_mine_guid = "other_mine_guid";
            const otherMineTsf = { ...newTsf, mine_guid: other_mine_guid } as ITailingsStorageFacility
            await store.dispatch(storeTsf(TSF));
            await store.dispatch(storeTsf(otherMineTsf));

            const state = store.getState()[tsfReducerType];

            const firstTSFState = getTsfsByMineGuid(mineGuid)({ [tsfReducerType]: state });
            const otherTSFState = getTsfsByMineGuid(other_mine_guid)({ [tsfReducerType]: state });

            expect(firstTSFState).toHaveLength(1);
            expect(firstTSFState).toContainEqual(TSF);

            expect(otherTSFState).toHaveLength(1);
            expect(otherTSFState).toContainEqual(otherMineTsf);
        });
    });

});
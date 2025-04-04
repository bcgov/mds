import { configureStore } from "@reduxjs/toolkit";
import damReducer, {
    getDams,
    storeDam,
    createDam,
    updateDam,
    fetchDamHistory,
    getDamByGuid,
    damReducerType
} from "./damSlice";
import CustomAxios from "../customAxios";
import { DAM_WITH_HISTORY } from "@mds/common/tests/mocks/dataMocks";
import { ICreateDam } from "@mds/common/interfaces";
import { ConsequenceClassificationStatusCodeEnum, DamTypeEnum, OperatingStatusEnum } from "@mds/common/constants/enums";

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

const damGuid = DAM_WITH_HISTORY.dam_guid;

describe('damSlice', () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                [damReducerType]: damReducer
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("storeDam/getDamByGuid", () => {
        it("should store the dam in the state and retrieve it correctly", async () => {
            await store.dispatch(storeDam(DAM_WITH_HISTORY));
            const state = store.getState();

            expect(getDamByGuid(damGuid)(state)).toEqual(DAM_WITH_HISTORY);
        });
    });

    describe("createDam", () => {
        it("should create dam successfully", async () => {

            const newDam: ICreateDam = {
                consequence_classification: ConsequenceClassificationStatusCodeEnum.LOW,
                current_dam_height: 1,
                current_elevation: 2,
                dam_name: "New Name",
                dam_type: DamTypeEnum.dam,
                latitude: 48,
                longitude: -113,
                max_pond_elevation: 4,
                min_freeboard_required: 6,
                mine_tailings_storage_facility_guid: "tsf-guid",
                operating_status: OperatingStatusEnum.construction,
                permitted_dam_crest_elevation: 7
            };

            const new_dam_guid = "new_dam_guid";
            const newDamResp = { ...newDam, dam_guid: new_dam_guid };

            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockResolvedValue(newDamResp),
            }));

            await store.dispatch(createDam(newDam));
            const state = store.getState()[damReducerType];

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            expect(getDams({ [damReducerType]: state })).toEqual({ [new_dam_guid]: newDamResp });
        });

    });
    describe("updateDam", () => {
        it("should update dam successfully", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                patch: jest.fn().mockResolvedValue({ data: DAM_WITH_HISTORY }),
            }));

            await store.dispatch(updateDam({ dam_guid: damGuid, dam_name: "Name" }));
            const state = store.getState()[damReducerType];

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            expect(getDams({ [damReducerType]: state })).toEqual({ [damGuid]: DAM_WITH_HISTORY });
        });

    });
    describe("fetchDamHistory", () => {
        it("should fetch dam history data successfully", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue({ data: DAM_WITH_HISTORY }),
            }));

            await store.dispatch(fetchDamHistory(damGuid));
            const state = store.getState()[damReducerType];

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            expect(getDams({ [damReducerType]: state })).toEqual({ [damGuid]: DAM_WITH_HISTORY });
        });
        it("should handle API error", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(fetchDamHistory(damGuid));
            const state = store.getState()[damReducerType];

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            expect(getDams({ [damReducerType]: state })).toEqual({});
        });
    });

});
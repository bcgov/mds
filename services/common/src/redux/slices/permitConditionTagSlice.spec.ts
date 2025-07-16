import {
    fetchPermitConditionTags,
    createPermitConditionTag,
    updatePermitConditionTag,
    deletePermitConditionTag,
    getPermitConditionTags,
    default as permitConditionTagReducer,
    permitConditionTagReducerType,
} from "./permitConditionTagSlice";
import { configureStore } from "@reduxjs/toolkit";
import CustomAxios from "../customAxios";
import { IPermitConditionTag } from "@mds/common/interfaces";

jest.mock("../customAxios");

describe("permitConditionTagSlice", () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                [permitConditionTagReducerType]: permitConditionTagReducer,
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch permit condition tags", async () => {
        const mockTags = [{ description: "Tag1" }, { description: "Tag2" }];
        (CustomAxios as jest.Mock).mockImplementation(() => ({
            get: jest.fn().mockResolvedValue({ data: { records: mockTags } }),
        }));

        await store.dispatch(fetchPermitConditionTags(undefined));

        const state = store.getState()[permitConditionTagReducerType];
        expect(state.permitConditionTags).toEqual(mockTags);
    });

    it("should create a permit condition tag", async () => {
        const newTag = { description: "NewTag" } as IPermitConditionTag;
        (CustomAxios as jest.Mock).mockImplementation(() => ({
            post: jest.fn().mockResolvedValue({ data: newTag }),
        }));

        await store.dispatch(createPermitConditionTag(newTag));

        const state = store.getState()[permitConditionTagReducerType];
        expect(state.permitConditionTags).toContainEqual(newTag);
    });

    it("should update a permit condition tag", async () => {
        const initialTag = { permit_condition_tag_guid: "1", description: "OldTag" };
        store.dispatch({ type: "permitConditionTags/createPermitConditionTag/fulfilled", payload: initialTag });

        const updatedTag = { permit_condition_tag_guid: "1", description: "UpdatedTag" };
        (CustomAxios as jest.Mock).mockImplementation(() => ({
            put: jest.fn().mockResolvedValue({ data: updatedTag }),
        }));

        await store.dispatch(updatePermitConditionTag(updatedTag));

        const state = store.getState()[permitConditionTagReducerType];
        expect(state.permitConditionTags.find(t => t.permit_condition_tag_guid === "1").description).toBe("UpdatedTag");
    });

    it("selector getPermitConditionTags returns tags", async () => {
        const mockTags = [{ description: "Tag1" }, { description: "Tag2" }];
        store.dispatch({ type: "permitConditionTags/fetchPermitConditionTags/fulfilled", payload: { records: mockTags } });

        const state = store.getState();
        expect(getPermitConditionTags(state)).toEqual(mockTags);
    });
});
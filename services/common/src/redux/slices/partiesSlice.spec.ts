import { configureStore } from "@reduxjs/toolkit";
import CustomAxios from "@mds/common/redux/customAxios";
import {
  partiesReducer,
  fetchParties,
  fetchPartyById,
  createParty,
  updateParty,
  deleteParty,
  fetchPartyRelationships,
  fetchAllPartyRelationships,
  addPartyRelationship,
  updatePartyRelationship,
  removePartyRelationship,
  addDocumentToRelationship,
  createPartyOrgBookEntity,
  deletePartyOrgBookEntity,
  mergeParties,
  fetchInspectors,
  fetchProjectLeads,
  setAddPartyFormState,
  getParties,
  getPartyIds,
  getPartyPageData,
  getLastCreatedParty,
} from "./partiesSlice";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

export const showLoadingMock = jest
  .fn()
  .mockReturnValue({ type: "SHOW_LOADING", payload: { show: true } });
export const hideLoadingMock = jest
  .fn()
  .mockReturnValue({ type: "HIDE_LOADING", payload: { show: false } });

jest.mock("@mds/common/redux/customAxios");
jest.mock("react-redux-loading-bar", () => ({
  showLoading: () => showLoadingMock,
  hideLoading: () => hideLoadingMock,
}));

describe("partiesSlice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        PARTIES: partiesReducer,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("async thunks", () => {
    it("fetchParties success", async () => {
      const mockResponse = { data: { records: [{ party_guid: "test123" }], total: 1 } };
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(mockResponse),
      }));

      await store.dispatch(fetchParties({}));
      expect(showLoadingMock).toHaveBeenCalled();
      expect(hideLoadingMock).toHaveBeenCalled();
      expect(store.getState().PARTIES.rawParties).toEqual(mockResponse.data.records);
    });

    it("fetchPartyById success", async () => {
      const mockResponse = { data: { party_guid: "test123" } };
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(mockResponse),
      }));

      await store.dispatch(fetchPartyById("test123"));
      expect(store.getState().PARTIES.parties["test123"]).toEqual(mockResponse.data);
    });

    it("createParty success", async () => {
      const mockResponse = { data: { party_guid: "new-party" } };
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        post: jest.fn().mockResolvedValue(mockResponse),
      }));

      await store.dispatch(createParty({ first_name: "John", party_name: "Doe" } as any));
      expect(store.getState().PARTIES.lastCreatedParty).toEqual(mockResponse.data);
    });

    it("updateParty success", async () => {
      const mockResponse = { data: { party_guid: "test123", first_name: "Jane" } };
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        put: jest.fn().mockResolvedValue(mockResponse),
      }));

      await store.dispatch(updateParty({ data: { first_name: "Jane" }, partyGuid: "test123" }));
      expect(CustomAxios).toHaveBeenCalled();
    });

    it("deleteParty success", async () => {
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        delete: jest.fn().mockResolvedValue({ data: {} }),
      }));

      await store.dispatch(deleteParty("test123"));
      expect(CustomAxios).toHaveBeenCalled();
    });

    it("fetchPartyRelationships success", async () => {
      const mockResponse = { data: [{ mine_party_appt_guid: "rel123" }] };
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(mockResponse),
      }));

      await store.dispatch(fetchPartyRelationships({ mine_guid: "mine123" }));
      expect(store.getState().PARTIES.partyRelationships).toEqual(mockResponse.data);
    });

    it("fetchAllPartyRelationships success", async () => {
      const mockResponse = { data: [{ mine_party_appt_guid: "rel123" }] };
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(mockResponse),
      }));

      await store.dispatch(fetchAllPartyRelationships({}));
      expect(store.getState().PARTIES.allPartyRelationships).toEqual(mockResponse.data);
    });

    it("addPartyRelationship success", async () => {
        (CustomAxios as jest.Mock).mockImplementation(() => ({
            post: jest.fn().mockResolvedValue({ data: {} }),
        }));
        await store.dispatch(addPartyRelationship({ data: {} as any }));
        expect(CustomAxios).toHaveBeenCalled();
    });

    it("updatePartyRelationship success", async () => {
        (CustomAxios as jest.Mock).mockImplementation(() => ({
            put: jest.fn().mockResolvedValue({ data: {} }),
        }));
        await store.dispatch(updatePartyRelationship({ data: { mine_party_appt_guid: "123" } }));
        expect(CustomAxios).toHaveBeenCalled();
    });

    it("removePartyRelationship success", async () => {
        (CustomAxios as jest.Mock).mockImplementation(() => ({
            delete: jest.fn().mockResolvedValue({ data: {} }),
        }));
        await store.dispatch(removePartyRelationship("123"));
        expect(CustomAxios).toHaveBeenCalled();
    });

    it("addDocumentToRelationship success", async () => {
        (CustomAxios as jest.Mock).mockImplementation(() => ({
            put: jest.fn().mockResolvedValue({ data: {} }),
        }));
        await store.dispatch(addDocumentToRelationship({ mineGuid: "m1", minePartyApptGuid: "r1", data: {} as any }));
        expect(CustomAxios).toHaveBeenCalled();
    });

    it("createPartyOrgBookEntity success", async () => {
        (CustomAxios as jest.Mock).mockImplementation(() => ({
            post: jest.fn().mockResolvedValue({ data: {} }),
        }));
        await store.dispatch(createPartyOrgBookEntity({ partyGuid: "p1", data: {} as any }));
        expect(CustomAxios).toHaveBeenCalled();
    });

    it("deletePartyOrgBookEntity success", async () => {
        (CustomAxios as jest.Mock).mockImplementation(() => ({
            delete: jest.fn().mockResolvedValue({ data: {} }),
        }));
        await store.dispatch(deletePartyOrgBookEntity("p1"));
        expect(CustomAxios).toHaveBeenCalled();
    });

    it("mergeParties success", async () => {
        const mockResponse = { data: { party_guid: "merged123" } };
        (CustomAxios as jest.Mock).mockImplementation(() => ({
            post: jest.fn().mockResolvedValue(mockResponse),
        }));
        await store.dispatch(mergeParties({ party_guids: ["1", "2"], party: {} } as any));
        expect(store.getState().PARTIES.lastCreatedParty).toEqual(mockResponse.data);
    });

    it("fetchInspectors success", async () => {
        const mockResponse = { data: { records: [{ party_guid: "ins1" }] } };
        (CustomAxios as jest.Mock).mockImplementation(() => ({
            get: jest.fn().mockResolvedValue(mockResponse),
        }));
        await store.dispatch(fetchInspectors());
        expect(store.getState().PARTIES.inspectors).toEqual(mockResponse.data.records);
    });

    it("fetchProjectLeads success", async () => {
        const mockResponse = { data: { records: [{ party_guid: "pl1" }] } };
        (CustomAxios as jest.Mock).mockImplementation(() => ({
            get: jest.fn().mockResolvedValue(mockResponse),
        }));
        await store.dispatch(fetchProjectLeads());
        expect(store.getState().PARTIES.projectLeads).toEqual(mockResponse.data.records);
    });
  });

  describe("reducers", () => {
    it("setAddPartyFormState", () => {
      const mockState = { showingAddPartyForm: true };
      store.dispatch(setAddPartyFormState(mockState as any));
      expect(store.getState().PARTIES.addPartyFormState).toEqual(mockState);
    });
  });

  describe("selectors", () => {
    it("getParties", () => {
      const state = {
        PARTIES: {
          parties: { "123": { name: "test" } },
        },
      };
      expect(getParties(state as any)).toEqual(state.PARTIES.parties);
    });

    it("getPartyIds", () => {
      const state = {
        PARTIES: {
          partyIds: ["123"],
        },
      };
      expect(getPartyIds(state as any)).toEqual(["123"]);
    });

    it("getPartyPageData", () => {
        const state = {
          PARTIES: {
            partyPageData: { current_page: 1 },
          },
        };
        expect(getPartyPageData(state as any)).toEqual({ current_page: 1 });
      });

      it("getLastCreatedParty", () => {
        const state = {
          PARTIES: {
            lastCreatedParty: { party_guid: "123" },
          },
        };
        expect(getLastCreatedParty(state as any)).toEqual({ party_guid: "123" });
      });
  });
});

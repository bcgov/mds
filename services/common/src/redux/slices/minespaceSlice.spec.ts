import { IMinespaceUser } from "@mds/common/interfaces";
import {
    minespaceReducer,
    createMinespaceUser,
    updateMinespaceUserMines,
    fetchMinespaceUsers,
    fetchMinespaceUsersByMine,
    fetchMinespaceUserMines,
    deleteMinespaceUser,
    fetchMinistryContacts,
    fetchMinistryContactsByRegion,
    createMinistryContact,
    updateMinistryContact,
    deleteMinistryContact,
    fetchCurrentUserAccessRequest,
    submitNewUserAccessRequest,
    getMinespaceUsers,
    getMinespaceUsersByMine,
    getMinespaceUsersByMineGuid,
    getMinespaceUserMines,
    getMinistryContacts,
    getMinistryContactsByRegion,
    getMinespaceUserEmailHash,
} from "./minespaceSlice";
import CustomAxios from "@mds/common/redux/customAxios";
import { configureStore } from "@reduxjs/toolkit";
import { notification } from "antd";

const showLoadingMock = jest.fn();
const hideLoadingMock = jest.fn();

jest.mock("@mds/common/redux/customAxios");
jest.mock("react-redux-loading-bar", () => ({
    showLoading: () => showLoadingMock,
    hideLoading: () => hideLoadingMock,
}));
jest.mock("antd", () => ({
    notification: {
        success: jest.fn(),
    },
}));

describe("minespaceSlice", () => {
    let store;

    const mockMinespaceUser: IMinespaceUser = {
        user_id: 1,
        bceid_username: "test@example.com",
        mines: ["mine-guid-1", "mine-guid-2"],
        sub: "sub-guid-string@bceidboth",
        email: "email@email.com",
        given_name: "Given",
        family_name: "Family",
        display_name: "Given Family",
        identity_provider: "bceidboth",
        last_logged_in: "2025-10-31 22:39:29.200932+00"
    };

    const mockMinespaceUserMine = {
        mine_guid: "ddcf354f-b871-4702-95b6-2ff7a0618e42",
        mine_name: "Johnson Hampton",
        mine_no: "B030601",
        major_mine_ind: false,
        mine_note: "",
        mine_permit: [],
        mine_status: [],
        mine_tailings_storage_facilities: [],
        mine_type: [],
        mine_region: "SW",
    };

    const mockMinistryContact = {
        contact_guid: "contact-guid-1",
        contact_id: 1,
        deleted_ind: false,
        email: "john.doe@gov.bc.ca",
        emli_contact_type_code: "RO",
        fax_number: "250-123-4568",
        first_name: "John",
        is_general_contact: false,
        is_major_mine: false,
        last_name: "Doe",
        mailing_address_line_1: "123 Main St",
        mailing_address_line_2: "",
        mine_region_code: "NE",
        phone_number: "250-123-4567",
    };

    beforeEach(() => {
        store = configureStore({
            reducer: {
                minespace: minespaceReducer,
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("initial state", () => {
        it("should have correct initial state", () => {
            const state = minespaceReducer(undefined, { type: "@@INIT" });
            expect(state).toEqual({
                minespaceUsers: [],
                minespaceUsersByMine: {},
                minespaceUserMines: [],
                MinistryContacts: [],
                MinistryContactsByRegion: [],
                currentUserAccessRequest: undefined,
            });
        });
    });

    describe("createMinespaceUser", () => {
        const mockResponse = {
            data: mockMinespaceUser,
        };

        it("should successfully create a minespace user and add to state", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockResolvedValue(mockResponse),
            }));

            const payload = {
                bceid_username: "test@example.com",
                mine_guids: ["mine-guid-1"],
            };

            await store.dispatch(createMinespaceUser(payload));

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify notification
            expect((notification.success as jest.Mock)).toHaveBeenCalledWith({
                message: "Successfully created MineSpace user.",
                duration: 10,
            });

            // Verify API call
            expect(CustomAxios).toHaveBeenCalled();

            // Verify state update
            const state = store.getState();
            expect(state.minespace.minespaceUsers).toContain(mockMinespaceUser);
        });

        it("should handle API error when creating a minespace user", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockRejectedValue(error),
            }));

            const payload = {
                bceid_username: "test@example.com",
                mine_guids: ["mine-guid-1"],
            };

            await store.dispatch(createMinespaceUser(payload));

            expect((notification.success as jest.Mock)).not.toHaveBeenCalled();
        });
    });

    describe("updateMinespaceUserMines", () => {
        const mockResponse = {
            data: { ...mockMinespaceUser, mines: ["updated-mine-guid"] },
        };

        it("should successfully update a minespace user's mines and update state", async () => {
            // Pre-populate state with a user
            store.dispatch({
                type: "minespace/createMinespaceUser/fulfilled",
                payload: mockMinespaceUser,
            });

            (CustomAxios as jest.Mock).mockImplementation(() => ({
                put: jest.fn().mockResolvedValue(mockResponse),
            }));

            const payload = {
                minespace_id: 1,
                payload: { mine_guids: ["updated-mine-guid"] },
            };

            await store.dispatch(updateMinespaceUserMines(payload));

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify state update
            const state = store.getState();
            const updatedUser = state.minespace.minespaceUsers.find(
                (user) => user.user_id === 1
            );
            expect(updatedUser).toBeDefined();
            expect(updatedUser.mines).toEqual(["updated-mine-guid"]);
        });

        it("should handle API error when updating a minespace user", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                put: jest.fn().mockRejectedValue(error),
            }));

            const payload = {
                minespace_id: 1,
                payload: { mine_guids: ["updated-mine-guid"] },
            };

            await store.dispatch(updateMinespaceUserMines(payload));

            expect((notification.success as jest.Mock)).not.toHaveBeenCalled();
        });
    });

    describe("fetchMinespaceUsers", () => {
        const mockResponse = {
            data: { records: [mockMinespaceUser] },
        };

        it("should successfully fetch all minespace users", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue(mockResponse),
            }));

            await store.dispatch(fetchMinespaceUsers());

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify API call
            expect(CustomAxios).toHaveBeenCalled();

            // Verify state update
            const state = store.getState();
            expect(state.minespace.minespaceUsers).toEqual([mockMinespaceUser]);
        });

        it("should handle API error when fetching minespace users", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(fetchMinespaceUsers());

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("fetchMinespaceUsersByMine", () => {
        const mine_guid = "test-mine-guid";
        const mockResponse = {
            data: { records: [mockMinespaceUser] },
        };

        it("should successfully fetch minespace users by mine", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue(mockResponse),
            }));

            await store.dispatch(fetchMinespaceUsersByMine(mine_guid));

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify API call with mine_guid
            expect(CustomAxios).toHaveBeenCalled();

            // Verify state update
            const state = store.getState();
            expect(state.minespace.minespaceUsersByMine[mine_guid]).toEqual([mockMinespaceUser]);
        });

        it("should handle API error when fetching minespace users by mine", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(fetchMinespaceUsersByMine(mine_guid));

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("fetchMinespaceUserMines", () => {
        const mine_guids = ["mine-guid-1", "mine-guid-2"];
        const mockResponse = {
            data: [mockMinespaceUserMine],
        };

        it("should successfully fetch minespace user mines", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockResolvedValue(mockResponse),
            }));

            await store.dispatch(fetchMinespaceUserMines(mine_guids));

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify API call
            expect(CustomAxios).toHaveBeenCalled();

            // Verify state update
            const state = store.getState();
            expect(state.minespace.minespaceUserMines).toEqual([mockMinespaceUserMine]);
        });

        it("should handle API error when fetching minespace user mines", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(fetchMinespaceUserMines(mine_guids));

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("deleteMinespaceUser", () => {
        const mockResponse = {
            data: "",
            status: 204,
        };

        it("should successfully delete a minespace user and remove from state", async () => {
            // Pre-populate state with a user
            store.dispatch({
                type: "minespace/createMinespaceUser/fulfilled",
                payload: mockMinespaceUser,
            });

            (CustomAxios as jest.Mock).mockImplementation(() => ({
                delete: jest.fn().mockResolvedValue(mockResponse),
            }));

            await store.dispatch(deleteMinespaceUser(1));

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify state update - user should be removed
            const state = store.getState();
            expect(state.minespace.minespaceUsers).not.toContain(mockMinespaceUser);
        });

        it("should handle API error when deleting a minespace user", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                delete: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(deleteMinespaceUser(1));

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("fetchMinistryContacts", () => {
        const mockResponse = {
            data: { records: [mockMinistryContact] },
        };

        it("should successfully fetch ministry contacts", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue(mockResponse),
            }));

            await store.dispatch(fetchMinistryContacts());

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify state update
            const state = store.getState();
            expect(state.minespace.MinistryContacts).toEqual([mockMinistryContact]);
        });

        it("should handle API error when fetching ministry contacts", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(fetchMinistryContacts());

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("fetchMinistryContactsByRegion", () => {
        const region = "NE";
        const isMajorMine = true;
        const mockResponse = {
            data: { records: [mockMinistryContact] },
        };

        it("should successfully fetch ministry contacts by region", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue(mockResponse),
            }));

            await store.dispatch(fetchMinistryContactsByRegion({ region, isMajorMine }));

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify state update
            const state = store.getState();
            expect(state.minespace.MinistryContactsByRegion).toEqual([mockMinistryContact]);
        });

        it("should handle API error when fetching ministry contacts by region", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(fetchMinistryContactsByRegion({ region, isMajorMine }));

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("createMinistryContact", () => {
        const mockResponse = {
            data: mockMinistryContact,
        };

        it("should successfully create a ministry contact and add to state", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockResolvedValue(mockResponse),
            }));

            const payload = {
                first_name: "John",
                last_name: "Doe",
                email: "john.doe@gov.bc.ca",
            };

            await store.dispatch(createMinistryContact(payload));

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify notification
            expect((notification.success as jest.Mock)).toHaveBeenCalledWith({
                message: "Successfully created a new MCM contact.",
                duration: 10,
            });

            // Verify state update
            const state = store.getState();
            expect(state.minespace.MinistryContacts).toContain(mockMinistryContact);
        });

        it("should handle API error when creating a ministry contact", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockRejectedValue(error),
            }));

            const payload = {
                first_name: "John",
                last_name: "Doe",
                email: "john.doe@gov.bc.ca",
            };

            await store.dispatch(createMinistryContact(payload));

            expect((notification.success as jest.Mock)).not.toHaveBeenCalled();
        });
    });

    describe("updateMinistryContact", () => {
        const updatedContact = { ...mockMinistryContact, first_name: "Jane" };
        const mockResponse = {
            data: updatedContact,
        };

        it("should successfully update a ministry contact and update state", async () => {
            // Pre-populate state with a contact
            store.dispatch({
                type: "minespace/createMinistryContact/fulfilled",
                payload: mockMinistryContact,
            });

            (CustomAxios as jest.Mock).mockImplementation(() => ({
                put: jest.fn().mockResolvedValue(mockResponse),
            }));

            const payload = {
                contact_guid: "contact-guid-1",
                payload: { first_name: "Jane" },
            };

            await store.dispatch(updateMinistryContact(payload));

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify notification
            expect((notification.success as jest.Mock)).toHaveBeenCalledWith({
                message: "Successfully updated MCM contact.",
                duration: 10,
            });

            // Verify state update
            const state = store.getState();
            const contact = state.minespace.MinistryContacts.find(
                (c) => c.contact_guid === "contact-guid-1"
            );
            expect(contact.first_name).toBe("Jane");
        });

        it("should handle API error when updating a ministry contact", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                put: jest.fn().mockRejectedValue(error),
            }));

            const payload = {
                contact_guid: "contact-guid-1",
                payload: { first_name: "Jane" },
            };

            await store.dispatch(updateMinistryContact(payload));

            expect((notification.success as jest.Mock)).not.toHaveBeenCalled();
        });
    });

    describe("deleteMinistryContact", () => {
        const mockResponse = {
            data: "",
            status: 204,
        };

        it("should successfully delete a ministry contact and remove from state", async () => {
            // Pre-populate state with a contact
            store.dispatch({
                type: "minespace/createMinistryContact/fulfilled",
                payload: mockMinistryContact,
            });

            (CustomAxios as jest.Mock).mockImplementation(() => ({
                delete: jest.fn().mockResolvedValue(mockResponse),
            }));

            await store.dispatch(deleteMinistryContact("contact-guid-1"));

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify notification
            expect((notification.success as jest.Mock)).toHaveBeenCalledWith({
                message: "Successfully deleted MCM contact.",
                duration: 10,
            });

            // Verify state update - contact should be removed
            const state = store.getState();
            expect(state.minespace.MinistryContacts).not.toContain(mockMinistryContact);
        });

        it("should handle API error when deleting a ministry contact", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                delete: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(deleteMinistryContact("contact-guid-1"));

            expect((notification.success as jest.Mock)).not.toHaveBeenCalled();
        });
    });

    describe("selectors", () => {
        const mockState = {
            minespace: {
                minespaceUsers: [mockMinespaceUser],
                minespaceUsersByMine: { "mine-guid-1": [mockMinespaceUser] },
                minespaceUserMines: [mockMinespaceUserMine],
                MinistryContacts: [mockMinistryContact],
                MinistryContactsByRegion: [mockMinistryContact],
                currentUserAccessRequest: undefined,
            },
        };

        it("should select minespace users", () => {
            const result = getMinespaceUsers(mockState);
            expect(result).toEqual([mockMinespaceUser]);
        });

        it("should select minespace users by mine", () => {
            const result = getMinespaceUsersByMine(mockState);
            expect(result).toEqual({ "mine-guid-1": [mockMinespaceUser] });
        });

        it("should select minespace users by mine guid", () => {
            const selector = getMinespaceUsersByMineGuid("mine-guid-1");
            const result = selector(mockState);
            expect(result).toEqual([mockMinespaceUser]);
        });

        it("should return undefined for non-existent mine guid", () => {
            const selector = getMinespaceUsersByMineGuid("non-existent-mine");
            const result = selector(mockState);
            expect(result).toBeUndefined();
        });

        it("should select minespace user mines", () => {
            const result = getMinespaceUserMines(mockState);
            expect(result).toEqual([mockMinespaceUserMine]);
        });

        it("should select ministry contacts", () => {
            const result = getMinistryContacts(mockState);
            expect(result).toEqual([mockMinistryContact]);
        });

        it("should select ministry contacts by region", () => {
            const result = getMinistryContactsByRegion(mockState);
            expect(result).toEqual([mockMinistryContact]);
        });

        it("should create email hash from minespace users", () => {
            const result = getMinespaceUserEmailHash(mockState);
            expect(result).toEqual({
                "test@example.com": mockMinespaceUser,
            });
        });
    });

    describe("fetchCurrentUserAccessRequest", () => {
        const mockAccessRequest = {
            email_address: "test@example.com",
            proponent_name: "Test Proponent",
            authorization_letter: "auth-doc-guid",
            status: "PEN",
        };

        const mockResponse = {
            data: mockAccessRequest,
        };

        it("should successfully fetch current user access request", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockResolvedValue(mockResponse),
            }));

            await store.dispatch(fetchCurrentUserAccessRequest());

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify state update
            const state = store.getState();
            expect(state.minespace.currentUserAccessRequest).toEqual({
                access_request: mockAccessRequest,
            });
        });

        it("should handle 404 error (no existing request) gracefully", async () => {
            const error = {
                response: { status: 404 },
            };
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(fetchCurrentUserAccessRequest());

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // State should be null for 404
            const state = store.getState();
            expect(state.minespace.currentUserAccessRequest).toBeNull();
        });

        it("should handle non-404 API errors", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                get: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(fetchCurrentUserAccessRequest());

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("submitNewUserAccessRequest", () => {
        const mockAccessRequest = {
            email_address: "test@example.com",
            proponent_name: "Test Proponent",
            authorization_letter: "auth-doc-guid",
            role_requested: "PMT"
        };

        const mockFormData: IMinespaceUser = {
            user_id: 0,
            bceid_username: "test@example.com",
            mines: ["mine-guid-1"],
            documents: [{ document_name: "doc-1", document_manager_guid: "doc-guid-1" }],
            access_request: mockAccessRequest,
            sub: "sub-guid-string@bceidboth",
            email: "test@example.com",
            given_name: "Test",
            family_name: "User",
            display_name: "Test User",
            identity_provider: "bceidboth",
            last_logged_in: "2025-10-31 22:39:29.200932+00",
        };

        const mockResponse = {
            data: mockAccessRequest,
        };

        it("should successfully submit new user access request", async () => {
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockResolvedValue(mockResponse),
            }));

            await store.dispatch(submitNewUserAccessRequest(mockFormData));

            // Verify loading state management
            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);

            // Verify state update
            const state = store.getState();
            expect(state.minespace.currentUserAccessRequest).toEqual({
                access_request: mockAccessRequest,
            });
        });

        it("should handle API error when submitting access request", async () => {
            const error = new Error("API Error");
            (CustomAxios as jest.Mock).mockImplementation(() => ({
                post: jest.fn().mockRejectedValue(error),
            }));

            await store.dispatch(submitNewUserAccessRequest(mockFormData));

            expect(showLoadingMock).toHaveBeenCalledTimes(1);
            expect(hideLoadingMock).toHaveBeenCalledTimes(1);
        });
    });
});

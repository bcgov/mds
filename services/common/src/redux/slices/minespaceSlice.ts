import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import * as API from "@mds/common/constants/API";
import * as String from "@mds/common/constants/strings";
import { notification } from "antd";
import { createSelector } from "reselect";
import { IMinistryContact, IMinespaceUser, IMinespaceUserMine, IDistributionList } from "@mds/common/interfaces";
import { IPageData } from "@mds/common/interfaces/common/pageData.interface";

export const minespaceReducerType = "minespace";

interface MinespaceState {
    minespaceUsers: IMinespaceUser[];
    minespaceUsersByMine: { [mine_guid: string]: IMinespaceUser[] };
    minespaceUserMines: IMinespaceUserMine[];
    MinistryContacts: IMinistryContact[];
    DistributionLists: IPageData<IDistributionList>;
    MinistryContactsByRegion: IMinistryContact[];
    currentUserAccessRequest: IMinespaceUser | null | undefined;
}

const initialState: MinespaceState = {
    minespaceUsers: [],
    minespaceUsersByMine: {},
    minespaceUserMines: [],
    MinistryContacts: [],
    DistributionLists: { records: [], current_page: 1, total: 0, total_pages: 0, items_per_page: 25 },
    MinistryContactsByRegion: [],
    currentUserAccessRequest: undefined,
};

const minespaceSlice = createAppSlice({
    name: minespaceReducerType,
    initialState,
    reducers: (create) => ({
        createMinespaceUser: create.asyncThunk(
            async (payload: any, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                const response = await CustomAxios().post(
                    `${ENVIRONMENT.apiUrl}${API.MINESPACE_USER()}`,
                    payload,
                    headers
                );

                notification.success({
                    message: `Successfully created MineSpace user.`,
                    duration: 10,
                });

                thunkApi.dispatch(hideLoading());
                return response.data;
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    // Add the new user to the list
                    state.minespaceUsers.unshift(action.payload);
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
        updateMinespaceUserMines: create.asyncThunk(
            async ({ minespace_id, payload }: { minespace_id: number; payload: any }, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading("modal"));

                const response = await CustomAxios().put(
                    `${ENVIRONMENT.apiUrl}${API.UPDATE_MINESPACE_USER(minespace_id)}`,
                    payload,
                    headers
                );

                thunkApi.dispatch(hideLoading("modal"));
                return response.data;
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    // Update the specific user in the list
                    const userIndex = state.minespaceUsers.findIndex(
                        user => user.user_id === action.meta.arg.minespace_id
                    );
                    if (userIndex !== -1) {
                        state.minespaceUsers[userIndex] = action.payload;
                    }
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
        fetchMinespaceUsers: create.asyncThunk(
            async (includeRejected: boolean | void = false, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                try {
                    const params = includeRejected ? { include_rejected: 'true' } : {};
                    const response = await CustomAxios().get(
                        `${ENVIRONMENT.apiUrl}${API.MINESPACE_USER()}`,
                        { ...headers, params }
                    );
                    return response.data;
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    state.minespaceUsers = action.payload.records;
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
        fetchMinespaceUsersByMine: create.asyncThunk(
            async (mine_guid: string, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                try {
                    const response = await CustomAxios().get(
                        `${ENVIRONMENT.apiUrl}${API.MINESPACE_USER(mine_guid)}`,
                        headers
                    );
                    return { mine_guid, users: response.data.records };
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    const { mine_guid, users } = action.payload;
                    state.minespaceUsersByMine = { [mine_guid]: users };
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
        fetchMinespaceUserMines: create.asyncThunk(
            async (mine_guids: string[], thunkApi) => {
                const headers = createRequestHeader({ timeout: 60000 });
                thunkApi.dispatch(showLoading());

                try {
                    const response = await CustomAxios().post(
                        `${ENVIRONMENT.apiUrl}${API.MINE_BASIC_INFO_LIST}`,
                        { mine_guids, simple: true },
                        headers
                    );
                    return response.data;
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    state.minespaceUserMines = action.payload;
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
        deleteMinespaceUser: create.asyncThunk(
            async (minespaceUserId: number, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                try {
                    await CustomAxios({ errorToastMessage: String.ERROR }).delete(
                        `${ENVIRONMENT.apiUrl}${API.UPDATE_MINESPACE_USER(minespaceUserId)}`,
                        headers
                    );
                    return minespaceUserId;
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    state.minespaceUsers = state.minespaceUsers.filter(
                        user => user.user_id !== action.payload
                    );
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
        fetchMinistryContacts: create.asyncThunk(
            async (_: undefined, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                try {
                    const response = await CustomAxios().get(
                        `${ENVIRONMENT.apiUrl}${API.MINISTRY_CONTACTS}`,
                        headers
                    );
                    return response.data;
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    state.MinistryContacts = action.payload.records;
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
        fetchDistributionLists: create.asyncThunk(
            async (params: { page?: number; per_page?: number } = {}, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                try {
                    const response = await CustomAxios().get(
                        `${ENVIRONMENT.apiUrl}${API.DISTRIBUTION_LISTS}`,
                        { ...headers, params }
                    );
                    return response.data;
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    state.DistributionLists = action.payload;
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
        fetchMinistryContactsByRegion: create.asyncThunk(
            async ({ region, isMajorMine }: { region: string; isMajorMine: boolean }, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                try {
                    const response = await CustomAxios().get(
                        `${ENVIRONMENT.apiUrl}${API.MINISTRY_CONTACTS_BY_REGION(region, isMajorMine)}`,
                        headers
                    );
                    return response.data;
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    state.MinistryContactsByRegion = action.payload.records;
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
        createMinistryContact: create.asyncThunk(
            async (payload: any, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading("modal"));

                const response = await CustomAxios().post(
                    `${ENVIRONMENT.apiUrl}${API.MINISTRY_CONTACTS}`,
                    payload,
                    headers
                );

                notification.success({
                    message: `Successfully created a new MCM contact.`,
                    duration: 10,
                });

                thunkApi.dispatch(hideLoading("modal"));
                return response.data;
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    // Add the new contact to the list
                    state.MinistryContacts.unshift(action.payload);
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
        updateMinistryContact: create.asyncThunk(
            async ({ contact_guid, payload }: { contact_guid: string; payload: any }, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading("modal"));

                const response = await CustomAxios().put(
                    `${ENVIRONMENT.apiUrl}${API.MINISTRY_CONTACT(contact_guid)}`,
                    payload,
                    headers
                );

                notification.success({
                    message: `Successfully updated MCM contact.`,
                    duration: 10,
                });

                thunkApi.dispatch(hideLoading("modal"));
                return response.data;
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    // Update the specific contact in the list
                    const contactIndex = state.MinistryContacts.findIndex(
                        contact => contact.contact_guid === action.meta.arg.contact_guid
                    );
                    if (contactIndex !== -1) {
                        state.MinistryContacts[contactIndex] = { ...state.MinistryContacts[contactIndex], ...action.payload };
                    }

                    // Also update in the regional list if present
                    const regionalContactIndex = state.MinistryContactsByRegion.findIndex(
                        contact => contact.contact_guid === action.meta.arg.contact_guid
                    );
                    if (regionalContactIndex !== -1) {
                        state.MinistryContactsByRegion[regionalContactIndex] = action.payload;
                    }
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
        deleteMinistryContact: create.asyncThunk(
            async (contact_guid: string, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                await CustomAxios().delete(
                    `${ENVIRONMENT.apiUrl}${API.MINISTRY_CONTACT(contact_guid)}`,
                    headers
                );

                notification.success({
                    message: `Successfully deleted MCM contact.`,
                    duration: 10,
                });

                thunkApi.dispatch(hideLoading());
                return contact_guid;
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    // Remove the contact from both lists
                    state.MinistryContacts = state.MinistryContacts.filter(
                        contact => contact.contact_guid !== action.payload
                    );
                    state.MinistryContactsByRegion = state.MinistryContactsByRegion.filter(
                        contact => contact.contact_guid !== action.payload
                    );
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
        fetchCurrentUserAccessRequest: create.asyncThunk(
            async (_: void, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                try {
                    const response = await CustomAxios().get(
                        `${ENVIRONMENT.apiUrl}${API.NEW_MINESPACE_USER_ACCESS_REQUEST}`,
                        headers
                    );

                    thunkApi.dispatch(hideLoading());
                    return response.data;
                } catch (error) {
                    thunkApi.dispatch(hideLoading());
                    // Return null if request doesn't exist yet (404) - this is expected for new users
                    if (error.response?.status === 404) {
                        return null;
                    }
                    throw error;
                }
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    state.currentUserAccessRequest = (action.payload ? { access_request: action.payload } : null) as IMinespaceUser;
                },
                rejected: (state: MinespaceState, action) => {
                    // Handle actual errors (non-404)
                    rejectHandler(action);
                },
            }
        ),
        submitNewUserAccessRequest: create.asyncThunk(
            async (formData: IMinespaceUser, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                try {
                    const requestData = {
                        ...formData.access_request,
                        mines: formData.mines,
                        documents: formData.documents,
                        is_submitting: true
                    };

                    const response = await CustomAxios({
                        errorToastMessage: "Failed to submit access request",
                        successToastMessage: "Access request submitted successfully"
                    }).post(`${ENVIRONMENT.apiUrl}${API.NEW_MINESPACE_USER_ACCESS_REQUEST}`, requestData, headers);

                    return response.data;
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
            },
            {
                fulfilled: (state: MinespaceState, action) => {
                    state.currentUserAccessRequest = { access_request: action.payload } as IMinespaceUser;
                },
                rejected: (state: MinespaceState, action) => {
                    rejectHandler(action);
                },
            }
        ),
    }),
    selectors: {
        getMinespaceUsers: (state) => state.minespaceUsers,
        getMinespaceUsersByMine: (state) => state.minespaceUsersByMine,
        getMinespaceUserMines: (state) => state.minespaceUserMines,
        getMinistryContacts: (state) => state.MinistryContacts,
        getDistributionLists: (state) => state.DistributionLists,
        getMinistryContactsByRegion: (state) => state.MinistryContactsByRegion,
        getCurrentUserAccessRequest: (state) => state.currentUserAccessRequest,
    },
});

export const {
    getMinespaceUsers,
    getMinespaceUsersByMine,
    getMinespaceUserMines,
    getMinistryContacts,
    getDistributionLists,
    getMinistryContactsByRegion,
    getCurrentUserAccessRequest,
} = minespaceSlice.selectors;

export const getMinespaceUserEmailHash = createSelector(
    [getMinespaceUsers],
    (users) =>
        users.reduce(
            (map, fields) => ({
                [fields.bceid_username]: fields,
                ...map,
            }),
            {}
        )
);

export const getMinespaceUsersByMineGuid = (mine_guid: string) =>
    createSelector([getMinespaceUsersByMine], (usersByMine) => {
        return usersByMine[mine_guid];
    });

export const {
    createMinespaceUser,
    updateMinespaceUserMines,
    fetchMinespaceUsers,
    fetchMinespaceUsersByMine,
    fetchMinespaceUserMines,
    deleteMinespaceUser,
    fetchMinistryContacts,
    fetchDistributionLists,
    fetchMinistryContactsByRegion,
    createMinistryContact,
    updateMinistryContact,
    deleteMinistryContact,
    fetchCurrentUserAccessRequest,
    submitNewUserAccessRequest,
} = minespaceSlice.actions; export const minespaceReducer = minespaceSlice.reducer;

export default minespaceReducer;

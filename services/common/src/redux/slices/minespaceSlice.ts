import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import * as API from "@mds/common/constants/API";
import * as String from "@mds/common/constants/strings";
import { notification } from "antd";
import { createSelector } from "reselect";
import { IMinistryContact, IMinespaceUser, IMinespaceUserMine } from "@mds/common/interfaces";

export const minespaceReducerType = "minespace";

interface MinespaceState {
    minespaceUsers: IMinespaceUser[];
    minespaceUsersByMine: { [mine_guid: string]: IMinespaceUser[] };
    minespaceUserMines: IMinespaceUserMine[];
    MinistryContacts: IMinistryContact[];
    MinistryContactsByRegion: IMinistryContact[];
}

const initialState: MinespaceState = {
    minespaceUsers: [],
    minespaceUsersByMine: {},
    minespaceUserMines: [],
    MinistryContacts: [],
    MinistryContactsByRegion: [],
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
                return response.data.records;
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
            async (_: undefined, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                try {
                    const response = await CustomAxios().get(
                        `${ENVIRONMENT.apiUrl}${API.MINESPACE_USER()}`,
                        headers
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
    }),
    selectors: {
        getMinespaceUsers: (state) => state.minespaceUsers,
        getMinespaceUsersByMine: (state) => state.minespaceUsersByMine,
        getMinespaceUserMines: (state) => state.minespaceUserMines,
        getMinistryContacts: (state) => state.MinistryContacts,
        getMinistryContactsByRegion: (state) => state.MinistryContactsByRegion,
    },
});

export const {
    getMinespaceUsers,
    getMinespaceUsersByMine,
    getMinespaceUserMines,
    getMinistryContacts,
    getMinistryContactsByRegion,
} = minespaceSlice.selectors;

export const getMinespaceUserEmailHash = createSelector(
    [getMinespaceUsers],
    (users) =>
        users.reduce(
            (map, fields) => ({
                [fields.email_or_username]: fields,
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
    fetchMinistryContactsByRegion,
    createMinistryContact,
    updateMinistryContact,
    deleteMinistryContact,
} = minespaceSlice.actions; export const minespaceReducer = minespaceSlice.reducer;

export default minespaceReducer;

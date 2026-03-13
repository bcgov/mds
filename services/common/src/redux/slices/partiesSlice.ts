import { createAppSlice } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { notification } from "antd";
import {
  IParty,
  ItemMap,
  IPartyAppt,
  IPageData,
  IAddPartyFormState,
  IOption,
  ICreateParty,
  IPartyFetchParams,
  IAddPartyAppointment,
  IUpdatePartyAppointment,
  IPartyApptFetchParams,
  IAddRelationshipDocument,
  ICreateOrgBookEntity,
  IMergeParties,
} from "@mds/common/interfaces";
import {
  createItemMap,
  createItemIdsArray,
  createDropDownList,
  createLabelHash,
} from "@mds/common/redux/utils/helpers";
import { PARTIES } from "@mds/common/constants/reducerTypes";
import { RootState } from "@mds/common/redux/rootState";
import { createSelector } from "@reduxjs/toolkit";
import queryString from "query-string";
import { removeNullValues } from "@mds/common/constants/utils";
import * as Strings from "@mds/common/constants/strings";
import moment from "moment";

export const partiesReducerType = PARTIES;

interface PartiesState {
  parties: ItemMap<IParty>;
  rawParties: IParty[];
  partyIds: string[];
  partyRelationships: IPartyAppt[];
  allPartyRelationships: IPartyAppt[];
  partyPageData: IPageData<IParty>;
  addPartyFormState: IAddPartyFormState;
  lastCreatedParty: IParty;
  inspectors: IParty[];
  projectLeads: IParty[];
  consultationAdvisors: IParty[];
  engineersOfRecordOptions: IOption[];
  engineersOfRecord: IPartyAppt[];
  qualifiedPersons: IPartyAppt[];
}

const initialState: PartiesState = {
  parties: {},
  rawParties: [],
  partyIds: [],
  partyRelationships: [],
  allPartyRelationships: [],
  partyPageData: {} as IPageData<IParty>,
  addPartyFormState: {} as IAddPartyFormState,
  lastCreatedParty: {} as IParty,
  inspectors: [],
  projectLeads: [],
  consultationAdvisors: [],
  engineersOfRecordOptions: [],
  engineersOfRecord: [],
  qualifiedPersons: [],
};

const partiesSlice = createAppSlice({
  name: partiesReducerType,
  initialState,
  reducers: (create) => ({
    setAddPartyFormState: create.reducer((state, action: { payload: IAddPartyFormState }) => {
      state.addPartyFormState = action.payload;
    }),
    fetchParties: create.asyncThunk(
      async (params: IPartyFetchParams = {}, thunkApi) => {
        thunkApi.dispatch(showLoading("modal"));
        try {
          const response = await CustomAxios().get(
            ENVIRONMENT.apiUrl + API.PARTIES_LIST_QUERY(params),
            createRequestHeader()
          );
          return response.data;
        } finally {
          thunkApi.dispatch(hideLoading("modal"));
        }
      },
      {
        fulfilled: (state, action) => {
          state.rawParties = action.payload.records;
          state.parties = createItemMap(action.payload.records, "party_guid");
          state.partyIds = createItemIdsArray(action.payload.records, "party_guid");
          state.partyPageData = action.payload;
        },
      }
    ),
    fetchPartyById: create.asyncThunk(
      async (id: string, thunkApi) => {
        thunkApi.dispatch(showLoading());
        try {
          const response = await CustomAxios().get(
            `${ENVIRONMENT.apiUrl + API.PARTY}/${id}`,
            createRequestHeader()
          );
          return response.data;
        } finally {
          thunkApi.dispatch(hideLoading());
        }
      },
      {
        fulfilled: (state, action) => {
          state.rawParties = [action.payload];
          state.parties = createItemMap([action.payload], "party_guid");
          state.partyIds = createItemIdsArray([action.payload], "party_guid");
        },
      }
    ),
    createParty: create.asyncThunk(
      async (payload: ICreateParty, thunkApi) => {
        thunkApi.dispatch(showLoading("modal"));
        try {
          const response = await CustomAxios().post(
            ENVIRONMENT.apiUrl + API.PARTY,
            payload,
            createRequestHeader()
          );
          notification.success({
            message: "Successfully created a new contact",
            duration: 10,
          });
          return response.data;
        } finally {
          thunkApi.dispatch(hideLoading("modal"));
        }
      },
      {
        fulfilled: (state, action) => {
          state.lastCreatedParty = action.payload;
          state.rawParties = [action.payload];
        },
      }
    ),
    updateParty: create.asyncThunk(
      async (payload: { data: Partial<ICreateParty>; partyGuid: string }, thunkApi) => {
        const { data, partyGuid } = payload;
        const name = data.first_name ? `${data.first_name}  ${data.party_name}` : data.party_name;
        thunkApi.dispatch(showLoading("modal"));
        try {
          const response = await CustomAxios().put(
            `${ENVIRONMENT.apiUrl + API.PARTY}/${partyGuid}`,
            data,
            createRequestHeader()
          );
          notification.success({
            message: `Successfully updated ${name}`,
            duration: 10,
          });
          return response.data;
        } finally {
          thunkApi.dispatch(hideLoading("modal"));
        }
      }
    ),
    deleteParty: create.asyncThunk(async (party_guid: string, thunkApi) => {
      thunkApi.dispatch(showLoading());
      try {
        const response = await CustomAxios({ errorToastMessage: Strings.ERROR }).delete(
          `${ENVIRONMENT.apiUrl + API.PARTY}/${party_guid}`,
          createRequestHeader()
        );
        notification.success({
          message: "Successfully removed the party",
          duration: 10,
        });
        return response.data;
      } finally {
        thunkApi.dispatch(hideLoading());
      }
    }),
    fetchPartyRelationships: create.asyncThunk(
      async (params: IPartyApptFetchParams, thunkApi) => {
        thunkApi.dispatch(showLoading());
        try {
          const response = await CustomAxios().get(
            `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}?${queryString.stringify(params)}`,
            createRequestHeader()
          );
          return response.data;
        } finally {
          thunkApi.dispatch(hideLoading());
        }
      },
      {
        fulfilled: (state, action) => {
          state.partyRelationships = action.payload;
        },
      }
    ),
    fetchAllPartyRelationships: create.asyncThunk(
      async (params: IPartyApptFetchParams, thunkApi) => {
        thunkApi.dispatch(showLoading());
        try {
          const response = await CustomAxios().get(
            `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}?${queryString.stringify(params)}`,
            createRequestHeader()
          );
          return response.data;
        } finally {
          thunkApi.dispatch(hideLoading());
        }
      },
      {
        fulfilled: (state, action) => {
          state.allPartyRelationships = action.payload;
        },
      }
    ),
    addPartyRelationship: create.asyncThunk(
      async (payload: { data: IAddPartyAppointment; successMessage?: string }, thunkApi) => {
        const { data, successMessage } = payload;
        thunkApi.dispatch(showLoading("modal"));
        try {
          const response = await CustomAxios().post(
            ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP,
            data,
            createRequestHeader()
          );
          notification.success({
            message: successMessage || `Successfully updated contact information`,
            duration: 10,
          });
          return response.data;
        } finally {
          thunkApi.dispatch(hideLoading("modal"));
        }
      }
    ),
    updatePartyRelationship: create.asyncThunk(
      async (
        payload: { data: Partial<IUpdatePartyAppointment>; successMessage?: string },
        thunkApi
      ) => {
        const { data, successMessage } = payload;
        thunkApi.dispatch(showLoading("modal"));
        const sanitizedPayload = removeNullValues(data);
        try {
          const response = await CustomAxios().put(
            `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}/${data.mine_party_appt_guid}`,
            sanitizedPayload,
            createRequestHeader()
          );
          notification.success({
            message: successMessage || `Successfully updated contact information`,
            duration: 10,
          });
          return response.data;
        } finally {
          thunkApi.dispatch(hideLoading("modal"));
        }
      }
    ),
    removePartyRelationship: create.asyncThunk(async (mine_party_appt_guid: string, thunkApi) => {
      thunkApi.dispatch(showLoading());
      try {
        const response = await CustomAxios({ errorToastMessage: Strings.ERROR }).delete(
          `${ENVIRONMENT.apiUrl + API.PARTY_RELATIONSHIP}/${mine_party_appt_guid}`,
          createRequestHeader()
        );
        notification.success({
          message: "Successfully removed the contact",
          duration: 10,
        });
        return response.data;
      } finally {
        thunkApi.dispatch(hideLoading());
      }
    }),
    addDocumentToRelationship: create.asyncThunk(
      async (
        payload: { mineGuid: string; minePartyApptGuid: string; data: IAddRelationshipDocument },
        thunkApi
      ) => {
        const { mineGuid, minePartyApptGuid, data } = payload;
        thunkApi.dispatch(showLoading("modal"));
        try {
          const response = await CustomAxios().put(
            ENVIRONMENT.apiUrl + API.MINE_PARTY_APPOINTMENT_DOCUMENTS(mineGuid, minePartyApptGuid),
            data,
            createRequestHeader()
          );
          return response.data;
        } finally {
          thunkApi.dispatch(hideLoading("modal"));
        }
      }
    ),
    createPartyOrgBookEntity: create.asyncThunk(
      async (payload: { partyGuid: string; data: ICreateOrgBookEntity }, thunkApi) => {
        const { partyGuid, data } = payload;
        thunkApi.dispatch(showLoading("modal"));
        try {
          const response = await CustomAxios().post(
            ENVIRONMENT.apiUrl + API.PARTY_ORGBOOK_ENTITY(partyGuid),
            data,
            createRequestHeader()
          );
          notification.success({
            message: "Successfully associated party with OrgBook entity",
            duration: 10,
          });
          return response.data;
        } finally {
          thunkApi.dispatch(hideLoading("modal"));
        }
      }
    ),
    deletePartyOrgBookEntity: create.asyncThunk(async (partyGuid: string, thunkApi) => {
      thunkApi.dispatch(showLoading("modal"));
      try {
        const response = await CustomAxios().delete(
          ENVIRONMENT.apiUrl + API.PARTY_ORGBOOK_ENTITY(partyGuid),
          createRequestHeader()
        );
        notification.success({
          message: "Successfully disassociated party with OrgBook entity",
          duration: 10,
        });
        return response.data;
      } finally {
        thunkApi.dispatch(hideLoading("modal"));
      }
    }),
    mergeParties: create.asyncThunk(
      async (payload: IMergeParties, thunkApi) => {
        thunkApi.dispatch(showLoading());
        try {
          const response = await CustomAxios().post(
            ENVIRONMENT.apiUrl + API.MERGE_PARTIES(),
            payload,
            createRequestHeader()
          );
          notification.success({
            message: "Successfully merged.",
            duration: 10,
          });
          return response.data;
        } finally {
          thunkApi.dispatch(hideLoading());
        }
      },
      {
        fulfilled: (state, action) => {
          state.lastCreatedParty = action.payload;
          state.rawParties = [action.payload];
        },
      }
    ),
    fetchInspectors: create.asyncThunk(
      async (_: never) => {
        const response = await CustomAxios().get(
          ENVIRONMENT.apiUrl +
          API.PARTIES_LIST_QUERY({
            per_page: "all",
            business_role: Strings.BUSINESS_ROLES.inspector,
          }),
          createRequestHeader()
        );
        return response.data;
      },
      {
        fulfilled: (state, action) => {
          state.inspectors = action.payload.records;
        },
      }
    ),
    fetchProjectLeads: create.asyncThunk(
      async (_: never) => {
        const response = await CustomAxios().get(
          ENVIRONMENT.apiUrl +
          API.PARTIES_LIST_QUERY({
            per_page: "all",
            business_role: Strings.BUSINESS_ROLES.projectLead,
          }),
          createRequestHeader()
        );
        return response.data;
      },
      {
        fulfilled: (state, action) => {
          state.projectLeads = action.payload.records;
        },
      }
    ),
    fetchConsultationAdvisors: create.asyncThunk(
      async (_: never) => {
        const response = await CustomAxios().get(
          ENVIRONMENT.apiUrl +
          API.PARTIES_LIST_QUERY({
            per_page: "all",
            business_role: Strings.BUSINESS_ROLES.consultationAdvisor,
          }),
          createRequestHeader()
        );
        return response.data;
      },
      {
        fulfilled: (state, action) => {
          state.consultationAdvisors = action.payload.records;
        },
      }
    ),
  }),
  selectors: {
    getParties: (state) => state.parties,
    getRawParties: (state) => state.rawParties,
    getPartyIds: (state) => state.partyIds,
    getPartyRelationships: (state) => state.partyRelationships,
    getAllPartyRelationships: (state) => state.allPartyRelationships,
    getPartyPageData: (state) => state.partyPageData,
    getAddPartyFormState: (state) => state.addPartyFormState,
    getLastCreatedParty: (state) => state.lastCreatedParty,
    getInspectors: (state) => state.inspectors,
    getProjectLeads: (state) => state.projectLeads,
    getConsultationAdvisors: (state) => state.consultationAdvisors,
  },
});

export const {
  getParties,
  getRawParties,
  getPartyIds,
  getPartyRelationships,
  getAllPartyRelationships,
  getPartyPageData,
  getAddPartyFormState,
  getLastCreatedParty,
  getInspectors,
  getProjectLeads,
  getConsultationAdvisors,
} = partiesSlice.selectors;

export const getSummaryPartyRelationships = createSelector(
  [getPartyRelationships],
  (partyRelationships) =>
    partyRelationships.filter((pr) => ["MMG", "PMT"].includes(pr.mine_party_appt_type_code))
);

export const getDropdownInspectors = createSelector([getInspectors], (parties) => {
  const today = moment().utc();
  const activeInspectors = parties
    .filter((inspector) =>
      inspector.business_role_appts.find(
        (r) =>
          today.isSameOrAfter(r.start_date, "day") &&
          (today.isBefore(r.end_date, "day") || !r.end_date)
      )
    )
    .map((inspector) => ({
      value: inspector.party_guid,
      label: inspector.name,
    }));
  const inactiveInspectors = parties
    .filter((inspector) =>
      inspector.business_role_appts.find(
        (r) =>
          today.isSameOrAfter(r.end_date, "day") &&
          !activeInspectors.find((ins) => ins.value === inspector.party_guid)
      )
    )
    .map((inspector) => ({
      value: inspector.party_guid,
      label: inspector.name,
    }));
  return [
    { groupName: "Active", opt: activeInspectors },
    { groupName: "Inactive", opt: inactiveInspectors },
  ];
});

export const getDropdownProjectLeads = createSelector([getProjectLeads], (parties) => {
  const today = moment().utc();
  const activeProjectLeads = parties
    .filter((projectLead) =>
      projectLead.business_role_appts.find(
        (r) =>
          today.isSameOrAfter(r.start_date, "day") &&
          (today.isBefore(r.end_date, "day") || !r.end_date)
      )
    )
    .map((projectLead) => ({
      value: projectLead.party_guid,
      label: projectLead.name,
    }));
  const inactiveProjectLeads = parties
    .filter((projectLead) =>
      projectLead.business_role_appts.find(
        (r) =>
          today.isSameOrAfter(r.end_date, "day") &&
          !activeProjectLeads.find((prl) => prl.value === projectLead.party_guid)
      )
    )
    .map((projectLead) => ({
      value: projectLead.party_guid,
      label: projectLead.name,
    }));
  return [
    { groupName: "Active", opt: activeProjectLeads },
    { groupName: "Inactive", opt: inactiveProjectLeads },
  ];
});

export const getDropdownConsultationAdvisors = createSelector([getConsultationAdvisors], (parties) => {
  const today = moment().utc();
  const activeConsultationAdvisors = parties
    .filter((consultationAdvisor) =>
      consultationAdvisor.business_role_appts.find(
        (r) =>
          today.isSameOrAfter(r.start_date, "day") &&
          (today.isBefore(r.end_date, "day") || !r.end_date)
      )
    )
    .map((consultationAdvisor) => ({
      value: consultationAdvisor.party_guid,
      label: consultationAdvisor.name,
    }));
  const inactiveConsultationAdvisor = parties
    .filter((consultationAdvisor) =>
      consultationAdvisor.business_role_appts.find(
        (r) =>
          today.isSameOrAfter(r.end_date, "day") &&
          !activeConsultationAdvisors.find((prl) => prl.value === consultationAdvisor.party_guid)
      )
    )
    .map((consultationAdvisor) => ({
      value: consultationAdvisor.party_guid,
      label: consultationAdvisor.name,
    }));
  return [
    { groupName: "Active", opt: activeConsultationAdvisors },
    { groupName: "Inactive", opt: inactiveConsultationAdvisor },
  ];
});

export const getInspectorsList = (state: RootState) =>
  createDropDownList(state[PARTIES].inspectors, "name", "party_guid");

export const getProjectLeadsList = (state: RootState) =>
  createDropDownList(state[PARTIES].projectLeads, "name", "party_guid");

export const getConsultationAdvisorsList = (state: RootState) =>
  createDropDownList(state[PARTIES].consultationAdivsors, "name", "party_guid");

export const getInspectorsHash = createSelector([getInspectorsList], createLabelHash);
export const getProjectLeadsHash = createSelector([getProjectLeadsList], createLabelHash);
export const getConsultationAdvisorsHash = createSelector([getConsultationAdvisorsList], createLabelHash);

export const getMatchingPartyRelationships = (
  mine_party_appt_type_code: string,
  related_guid = ""
) =>
  createSelector([getPartyRelationships], (relationships) => {
    return relationships.filter((mpa) => {
      return (
        mpa.mine_party_appt_type_code === mine_party_appt_type_code &&
        (related_guid === "" || mpa.related_guid === related_guid)
      );
    });
  });

export const {
  setAddPartyFormState,
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
  fetchConsultationAdvisors,
} = partiesSlice.actions;

export const partiesReducer = partiesSlice.reducer;
export default partiesReducer;

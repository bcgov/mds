import * as partiesReducer from "@/reducers/partiesReducer";

export const getParties = (state) => partiesReducer.getParties(state);
export const getPartyIds = (state) => partiesReducer.getPartyIds(state);
export const getPartyRelationshipTypes = (state) => partiesReducer.getPartyRelationshipTypes(state);

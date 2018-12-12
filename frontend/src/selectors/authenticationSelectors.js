import * as authenticationReducer from "@/reducers/authenticationReducer";

export const isAuthenticated = (state) => authenticationReducer.isAuthenticated(state);
export const getUserAccessData = (state) => authenticationReducer.getUserAccessData(state);
export const getUserInfo = (state) => authenticationReducer.getUserInfo(state);
export const getKeycloak = (state) => authenticationReducer.getKeycloak(state);

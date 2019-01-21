import * as userMineInfoReducer from "@/reducers/userMineInfoReducer";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const {
  getUserMineInfo,
  getExpectedDocumentStatusOptions,
  getMine,
  getMineDocuments,
} = userMineInfoReducer;

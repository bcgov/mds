import { IMine, IMineDocument, IPageData } from "@mds/common";
import * as ActionTypes from "../constants/actionTypes";

export const storeUserMineInfo = (payload: IPageData<IMine>) => ({
  type: ActionTypes.STORE_USER_MINE_INFO,
  payload,
});

export const storeMine = (payload: IMine) => ({
  type: ActionTypes.STORE_MINE,
  payload,
});

export const storeMineDocuments = (payload: IMineDocument[]) => ({
  type: ActionTypes.STORE_MINE_DOCUMENTS,
  payload,
});

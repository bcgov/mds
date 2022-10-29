import { createSelector } from "reselect";
import * as minespaceReducer from "../reducers/minespaceReducer";

export const {
  getMinespaceUsers,
  getMinespaceUserMines,
  getEMLIContacts,
  getEMLIContactsByRegion,
} = minespaceReducer;

export const getMinespaceUserEmailHash = createSelector([getMinespaceUsers], (user) =>
  user.reduce(
    (map, fields) => ({
      [fields.email]: fields,
      ...map,
    }),
    {}
  )
);

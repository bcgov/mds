import * as minespaceReducer from "../reducers/minespaceReducer";
import { createSelector } from "reselect";

export const getMinespaceUsers = (state) => minespaceReducer.getMinespaceUsers(state);

export const getMinespaceUserEmailHash = createSelector(
  [getMinespaceUsers],
  (user) =>
    user.reduce(
      (map, fields) => ({
        [fields.email]: fields,
        ...map,
      }),
      {}
    )
);

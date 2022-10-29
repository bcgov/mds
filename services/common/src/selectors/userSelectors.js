import { createSelector } from "reselect";
import * as userReducer from "../reducers/userReducer";
import { createLabelHash } from "../utils/helpers";

export const { getCoreUsers } = userReducer;

export const getDropdownCoreUsers = createSelector(
  [getCoreUsers],
  (users) =>
    users.map((user) => {
      // the username is prepended with "IDIR\", remove before displaying on UI
      const formattedLabel = user.idir_user_detail.username
        ? user.idir_user_detail.username.replace("IDIR\\", "")
        : "";
      return { value: user.core_user_guid, label: formattedLabel };
    })
);

export const getCoreUsersHash = createSelector(
  [getDropdownCoreUsers],
  createLabelHash
);

import * as userReducer from "@/reducers/userReducer";
import { createSelector } from "reselect";
import { createLabelHash } from "@/utils/helpers";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const { getCoreUsers } = userReducer;

export const getDropdownCoreUsers = createSelector(
  [getCoreUsers],
  (users) =>
    users.map((user) => {
      // the username is prepended with "IDIR\", remove before displaying on UI
      const formattedLabel = user.idir_user_detail.username.replace("IDIR\\", "");
      return { value: user.core_user_guid, label: formattedLabel };
    })
);

export const getCoreUsersHash = createSelector(
  [getDropdownCoreUsers],
  createLabelHash
);

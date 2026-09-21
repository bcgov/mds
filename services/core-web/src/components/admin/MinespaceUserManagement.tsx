import React, { FC, useEffect, useState } from "react";
import { flatMap, uniq } from "lodash";
import { Divider } from "antd";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import {
  getMinespaceUsers,
  getMinespaceUserEmailHash,
  getMinespaceUserMines,
  createMinespaceUser,
  fetchMinespaceUsers,
  deleteMinespaceUser,
  fetchMinespaceUserMines,
  updateMinespaceUserMines,
} from "@mds/common/redux/slices/minespaceSlice";
import { fetchMineNameList } from "@mds/common/redux/actionCreators/mineActionCreator";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { IMinespaceUser } from "@mds/common/interfaces";
import NewMinespaceUser from "@/components/admin/NewMinespaceUser";
import MinespaceUserList from "@/components/admin/MinespaceUserList";
import MinespaceUserAccessModal from "@/components/admin/MinespaceUserAccessModal";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";
import UpdateMinespaceUserModal from "../modalContent/UpdateMinespaceUserModal";

const MinespaceUserManagement: FC = () => {
  const dispatch = useAppDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const { isFeatureEnabled } = useFeatureFlag();
  const msNewLoginEnabled = isFeatureEnabled(Feature.MINESPACE_SIGNUP);

  const minespaceUsers = useAppSelector(getMinespaceUsers);
  const minespaceUserMines = useAppSelector(getMinespaceUserMines);
  const minespaceUserEmailHash = useAppSelector(getMinespaceUserEmailHash);

  useEffect(() => {
    dispatch(fetchMineNameList());
    dispatch(fetchMinespaceUsers(true));
  }, []);

  useEffect(() => {
    if (minespaceUsers.length > 0) {
      const mineGuidsFromMines = flatMap(minespaceUsers, (user) => user.mines);
      const mineGuidsFromRoles = flatMap(minespaceUsers, (user) => user.user_roles.map(role => role.mine_guid));
      const mine_guids = uniq([...mineGuidsFromMines, ...mineGuidsFromRoles]);
      dispatch(fetchMinespaceUserMines(mine_guids));
    }
  }, [minespaceUsers]);

  useEffect(() => {
    if (minespaceUserMines.length > 0) {
      setIsLoaded(true);
    }
  }, [minespaceUserMines]);

  const handleDelete = (userId: number) => {
    dispatch(deleteMinespaceUser(userId));
  };

  const handleUpdateNew = async (values: IMinespaceUser) => {
    const payload = {
      ...values,
      mine_guids: values.mines,
    };

    const result = await dispatch(updateMinespaceUserMines({ minespace_id: values.user_id, payload }));

    if (updateMinespaceUserMines.fulfilled.match(result)) {
      dispatch(closeModal());
    }
  };

  const handleUpdateLegacy = (record: IMinespaceUser) => {
    dispatch(updateMinespaceUserMines({ minespace_id: record.user_id, payload: record })).then(() => {
      dispatch(closeModal());
    });
  };

  const handleCreateUser = (values: any) => {
    dispatch(createMinespaceUser(values));
  };

  const handleOpenModal = (_event, record: IMinespaceUser) => {
    if (msNewLoginEnabled) {
      dispatch(openModal({
        props: {
          title: `Update User: ${record.display_name}`,
          handleUpdateUser: handleUpdateNew,
          user: record,
          mines: minespaceUserMines,
        },
        content: MinespaceUserAccessModal
      }));
    } else {
      dispatch(openModal({
        props: {
          title: `Update User: ${record.bceid_username}`,
          initialValues: record,
          handleSubmit: handleUpdateLegacy,
        },
        content: UpdateMinespaceUserModal,
        width: "75vw",
      }));
    }
  };

  return (
    <div className="tab__content">
      <h2>MineSpace User Management</h2>
      <Divider />
      <br />
      <NewMinespaceUser
        handleSubmit={handleCreateUser}
        minespaceUserEmailHash={minespaceUserEmailHash}
      />
      <h3>MineSpace Users</h3>
      <MinespaceUserList
        isLoaded={isLoaded}
        minespaceUsers={minespaceUsers}
        minespaceUserMines={minespaceUserMines}
        handleDelete={handleDelete}
        handleOpenModal={handleOpenModal}
      />
    </div>
  );
};

export default AuthorizationGuard(Permission.ADMIN)(MinespaceUserManagement);

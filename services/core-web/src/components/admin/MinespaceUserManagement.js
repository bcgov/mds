import React, { useEffect, useState } from "react";
import { flatMap, uniq } from "lodash";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider } from "antd";
import { getMineNames } from "@mds/common/redux/selectors/mineSelectors";
import { getMinespaceUsers, getMinespaceUserEmailHash } from "@mds/common/redux/slices/minespaceSlice";
import { fetchMineNameList } from "@mds/common/redux/actionCreators/mineActionCreator";
import {
  createMinespaceUser,
  fetchMinespaceUsers,
  deleteMinespaceUser,
  fetchMinespaceUserMines,
  updateMinespaceUserMines,
} from "@mds/common/redux/slices/minespaceSlice";
import { getMinespaceUserMines } from "@mds/common/redux/slices/minespaceSlice";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import CustomPropTypes from "@/customPropTypes";
import NewMinespaceUser from "@/components/admin/NewMinespaceUser";
import MinespaceUserList from "@/components/admin/MinespaceUserList";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import { modalConfig } from "@/components/modalContent/config";

/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */
const propTypes = {
  minespaceUsers: PropTypes.arrayOf(CustomPropTypes.minespaceUser),
  minespaceUserMines: PropTypes.arrayOf(CustomPropTypes.mineName),
  minespaceUserEmailHash: PropTypes.objectOf(PropTypes.any),
  fetchMineNameList: PropTypes.func.isRequired,
  fetchMinespaceUsers: PropTypes.func.isRequired,
  fetchMinespaceUserMines: PropTypes.func.isRequired,
  deleteMinespaceUser: PropTypes.func.isRequired,
  updateMinespaceUserMines: PropTypes.func.isRequired,
  createMinespaceUser: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
  minespaceUsers: [],
  minespaceUserMines: [],
  minespaceUserEmailHash: {},
};

export const MinespaceUserManagement = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { minespaceUsers, minespaceUserMines, minespaceUserEmailHash } = props;

  useEffect(() => {
    props.fetchMineNameList();
    props.fetchMinespaceUsers();
  }, []);

  useEffect(() => {
    if (minespaceUsers.length > 0) {
      const mine_guids = uniq(flatMap(minespaceUsers, (user) => user.mines));
      props.fetchMinespaceUserMines(mine_guids);
    }
  }, [minespaceUsers]);

  useEffect(() => {
    if (minespaceUserMines.length > 0) {
      setIsLoaded(true);
    }
  }, [minespaceUserMines]);

  const handleDelete = (userId) => {
    props.deleteMinespaceUser(userId);
  };

  const handleUpdate = (record) => {
    props.updateMinespaceUserMines({ minespace_id: record.user_id, payload: record }).then(() => {
      props.closeModal();
    });
  };

  const handleCreateUser = (values) => {
    props.createMinespaceUser(values);
  };

  const handleOpenModal = (e, record) => {
    props.openModal({
      props: {
        title: `Update User: ${record.bceid_username}`,
        initialValues: record,
        handleSubmit: handleUpdate,
      },
      content: modalConfig.UPDATE_MINESPACE_USERS,
      width: "75vw",
    });
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

const mapStateToProps = (state) => ({
  mines: getMineNames(state),
  minespaceUsers: getMinespaceUsers(state),
  minespaceUserEmailHash: getMinespaceUserEmailHash(state),
  minespaceUserMines: getMinespaceUserMines(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createMinespaceUser,
      fetchMineNameList,
      fetchMinespaceUsers,
      fetchMinespaceUserMines,
      deleteMinespaceUser,
      updateMinespaceUserMines,
      openModal,
      closeModal,
    },
    dispatch
  );

MinespaceUserManagement.propTypes = propTypes;
MinespaceUserManagement.defaultProps = defaultProps;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  AuthorizationGuard(Permission.ADMIN)
)(MinespaceUserManagement);

import React, { Component } from "react";
import { flatMap, uniq } from "lodash";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider } from "antd";
import { getMineNames } from "@common/selectors/mineSelectors";
import { getMinespaceUsers, getMinespaceUserEmailHash } from "@common/selectors/minespaceSelector";
import { fetchMineNameList } from "@common/actionCreators/mineActionCreator";
import {
  createMinespaceUser,
  fetchMinespaceUsers,
  deleteMinespaceUser,
  fetchMinespaceUserMines,
  updateMinespaceUserMines,
} from "@common/actionCreators/minespaceActionCreator";
import { getMinespaceUserMines } from "@common/reducers/minespaceReducer";
import { openModal, closeModal } from "@common/actions/modalActions";
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
};

const defaultProps = {
  minespaceUsers: [],
  minespaceUserMines: [],
  minespaceUserEmailHash: {},
};

export class MinespaceUserManagement extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchMineNameList().then(() => {
      this.setState({ isLoaded: true });
    });
    this.refreshUserData();
  }

  handleDelete = (userId) => {
    this.props.deleteMinespaceUser(userId).then(() => {
      this.props.fetchMinespaceUsers();
    });
  };

  handleCreateUser = (values) => {
    this.props.createMinespaceUser(values).then(() => {
      this.refreshUserData();
    });
  };

  handleOpenModal = (e, record) => {
    console.log(record);
    this.props.openModal({
      props: {
        title: "Update User",
        closeModal: this.props.closeModal,
        initialValues: record,
        handleSubmit: this.handleUpdate,
        refreshData: this.refreshUserData,
        minespaceUserEmailHash: this.props.minespaceUserEmailHash,
        afterClose: () => {},
        // onSubmit: this.handleUpdate,
      },
      content: modalConfig.UPDATE_MINESPACE_USERS,
      width: "75vw",
    });
  };

  handleUpdate = (record) => {
    // console.log("RECORD: ", record);
    this.props.updateMinespaceUserMines(record.user_id, record).then(() => {
      console.log("We in hereeee???")
      this.props.closeModal();
      this.refreshUserData();
      // this.refreshUserData();
    });
  };

  refreshUserData = () => {
    this.props.fetchMinespaceUsers().then(() => {
      const mine_guids = flatMap(this.props.minespaceUsers, (user) => user.mines);
      this.props.fetchMinespaceUserMines(uniq(mine_guids));
    });
  };

  render() {
    return (
      <div className="tab__content">
        <h2>MineSpace User Management</h2>
        <Divider />
        <br />
        <NewMinespaceUser
          handleSubmit={this.handleCreateUser}
          refreshData={this.refreshUserData}
          minespaceUserEmailHash={this.props.minespaceUserEmailHash}
        />
        <h3>MineSpace Users</h3>
        <MinespaceUserList
          isLoaded={this.state.isLoaded}
          minespaceUsers={this.props.minespaceUsers}
          minespaceUserMines={this.props.minespaceUserMines}
          handleDelete={this.handleDelete}
          handleOpenModal={this.handleOpenModal}
        />
      </div>
    );
  }
}

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

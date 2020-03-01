import React, { Component } from "react";
import { flatMap, uniq } from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getMineNames } from "@common/selectors/mineSelectors";
import { getMinespaceUsers } from "@common/selectors/minespaceSelector";
import { fetchMineNameList } from "@common/actionCreators/mineActionCreator";
import {
  fetchMinespaceUsers,
  deleteMinespaceUser,
  fetchMinespaceUserMines,
} from "@common/actionCreators/minespaceActionCreator";
import { getMinespaceUserMines } from "@common/reducers/minespaceReducer";
import CustomPropTypes from "@/customPropTypes";
import NewMinespaceUser from "@/components/admin/NewMinespaceUser";
import MinespaceUserList from "@/components/admin/MinespaceUserList";

/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */
const propTypes = {
  minespaceUsers: PropTypes.arrayOf(CustomPropTypes.minespaceUser),
  minespaceUserMines: PropTypes.arrayOf(CustomPropTypes.mineName),
  fetchMineNameList: PropTypes.func.isRequired,
  fetchMinespaceUsers: PropTypes.func.isRequired,
  fetchMinespaceUserMines: PropTypes.func.isRequired,
  deleteMinespaceUser: PropTypes.func.isRequired,
};

const defaultProps = {
  minespaceUsers: [],
  minespaceUserMines: [],
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

  refreshUserData = () => {
    this.props.fetchMinespaceUsers().then(() => {
      const mine_guids = flatMap(this.props.minespaceUsers, (user) => user.mines);
      this.props.fetchMinespaceUserMines(uniq(mine_guids));
    });
  };

  render() {
    return (
      <div>
        <h2>MineSpace User Management</h2>
        <br />
        <NewMinespaceUser refreshData={this.refreshUserData} />
        <h3>MineSpace Users</h3>
        <MinespaceUserList
          isLoaded={this.state.isLoaded}
          minespaceUsers={this.props.minespaceUsers}
          minespaceUserMines={this.props.minespaceUserMines}
          handleDelete={this.handleDelete}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMineNames(state),
  minespaceUsers: getMinespaceUsers(state),
  minespaceUserMines: getMinespaceUserMines(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNameList,
      fetchMinespaceUsers,
      fetchMinespaceUserMines,
      deleteMinespaceUser,
    },
    dispatch
  );

MinespaceUserManagement.propTypes = propTypes;
MinespaceUserManagement.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MinespaceUserManagement);

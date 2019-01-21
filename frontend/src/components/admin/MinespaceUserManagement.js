import React, { Component } from "react";
import NewMinespaceUser from "@/components/admin/NewMinespaceUser";
import MinespaceUserList from "@/components/admin/MinespaceUserList";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { getMineNames } from "@/selectors/mineSelectors";
import { getMinespaceUsers } from "@/selectors/minespaceSelector";
import { fetchMineNameList } from "@/actionCreators/mineActionCreator";
import { fetchMinespaceUsers, deleteMinespaceUser } from "@/actionCreators/minespaceActionCreator";

/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */
const propTypes = {
  mines: PropTypes.object,
  minespaceUsers: PropTypes.array,
  fetchMineNameList: PropTypes.func.isRequired,
  fetchMinespaceUsers: PropTypes.func.isRequired,
  deleteMinespaceUser: PropTypes.func.isRequired,
};

const defaultProps = {
  mines: {},
  minespaceUsers: {},
};

export class MinespaceUserManagement extends Component {
  componentDidMount() {
    this.props.fetchMineNameList();
    this.props.fetchMinespaceUsers();
  }

  handleDelete = (userId) => {
    this.props.deleteMinespaceUser(userId).then(() => {
      this.props.fetchMinespaceUsers();
    });
  };

  render() {
    console.log(this.props.minespaceUsers);
    console.log(this.props.mines.mines);
    return (
      <div className="tab__content">
        <h2>Minespace User Management</h2>
        <NewMinespaceUser />
        <h3>Minespace Users</h3>
        <MinespaceUserList
          minespaceUsers={this.props.minespaceUsers}
          mines={this.props.mines.mines}
          handleDelete={this.handleDelete}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMineNames(state),
  minespaceUsers: getMinespaceUsers(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNameList,
      fetchMinespaceUsers,
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

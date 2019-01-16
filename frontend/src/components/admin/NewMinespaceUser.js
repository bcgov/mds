import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import AddMinespaceUser from "@/components/Forms/AddMinespaceUser";
import { createDropDownList } from "@/utils/helpers";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import getMineNameList from "@/reducers/mineReducer";
import { updateExpectedDocument } from "@/actionCreators/mineActionCreator";
/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */

const propTypes = {
  updateExpectedDocument: PropTypes.func.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine),
};

const defaultProps = {
  mines: [],
};

export class NewMinespaceUser extends Component {
  componentDidMount() {
    // this.props.fetchMineRecords();
  }

  render() {
    return (
      <div>
        <h3>Add BCEID User</h3>
        <AddMinespaceUser />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMineNameList(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateExpectedDocument,
    },
    dispatch
  );

NewMinespaceUser.propTypes = propTypes;
NewMinespaceUser.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewMinespaceUser);

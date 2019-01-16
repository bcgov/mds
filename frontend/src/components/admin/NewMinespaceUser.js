import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import AddMinespaceUser from "@/components/Forms/AddMinespaceUser";
import { createDropDownList } from "@/utils/helpers";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { fetchMineNameList } from "@/actionCreators/mineActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
/**
 * @class AdminDashboard houses everything related to admin tasks, this is a permission-based route.
 */

const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  mines: PropTypes.object,
};

const defaultProps = {
  mines: {},
};

export class NewMinespaceUser extends Component {
  componentDidMount() {
    this.props.fetchMineNameList();
  }

  render() {
    return (
      <div>
        <h3>Add BCEID User</h3>
        {this.props.mines.mines && (
          <AddMinespaceUser
            mines={createDropDownList(this.props.mines.mines, "mine_name", "mine_name")}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMineNames(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNameList,
    },
    dispatch
  );

NewMinespaceUser.propTypes = propTypes;
NewMinespaceUser.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewMinespaceUser);

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

  createNewBCEIDUser = (values) => {
    console.log(values);
    console.log(values.user_bceid_email);
    //  const guids = values.proponent_mine_access.map((val) => val.split("~")[1]);
    //  const email = values.email;
    //  this.props.createMinespaceUser(email, guids);
  };

  render() {
    console.log(this.props.mines);
    return (
      <div>
        <h3>Add BCEID User</h3>
        {this.props.mines.mines && (
          <AddMinespaceUser
            mines={this.props.mines.mines.map((mine) => ({
              value: `${mine.mine_name}~${mine.guid}`,
              label: mine.mine_name,
            }))}
            handleSubmit={this.createNewBCEIDUser}
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

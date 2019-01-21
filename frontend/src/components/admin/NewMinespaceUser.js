import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import AddMinespaceUser from "@/components/Forms/AddMinespaceUser";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { fetchMineNameList } from "@/actionCreators/mineActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
import { createMinespaceUser, fetchMinespaceUsers } from "@/actionCreators/minespaceActionCreator";

const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mineName),
  createMinespaceUser: PropTypes.func.isRequired,
  fetchMinespaceUsers: PropTypes.func.isRequired,
};

const defaultProps = {
  mines: {},
};

export class NewMinespaceUser extends Component {
  componentDidMount() {
    this.props.fetchMineNameList();
  }

  createNewBCEIDUser = (values) => {
    const payload = {
      mine_guids: values.proponent_mine_access.map((val) => val.split("~")[1]),
      email: values.user_bceid_email,
    };

    this.props.createMinespaceUser(payload).then(() => {
      this.props.fetchMinespaceUsers();
    });
  };

  render() {
    return (
      <div>
        <h3>Add BCEID User</h3>
        {this.props.mines.mines && (
          <AddMinespaceUser
            mines={this.props.mines.mines.map((mine) => ({
              value: `${mine.mine_name}~${mine.guid}`,
              label: `${mine.mine_name}-${mine.mine_no}`,
            }))}
            onSubmit={this.createNewBCEIDUser}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMineNames(state).mines,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNameList,
      createMinespaceUser,
      fetchMinespaceUsers,
    },
    dispatch
  );

NewMinespaceUser.propTypes = propTypes;
NewMinespaceUser.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewMinespaceUser);

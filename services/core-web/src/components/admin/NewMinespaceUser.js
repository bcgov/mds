import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getMineNames } from "@common/selectors/mineSelectors";
import { fetchMineNameList } from "@common/actionCreators/mineActionCreator";
import { createMinespaceUser } from "@common/actionCreators/minespaceActionCreator";
import CustomPropTypes from "@/customPropTypes";
import AddMinespaceUser from "@/components/Forms/AddMinespaceUser";

const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mineName),
  createMinespaceUser: PropTypes.func.isRequired,
  refreshData: PropTypes.func,
};

const defaultProps = {
  mines: [],
  refreshData: () => {},
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
      this.props.refreshData();
    });
  };

  handleSearch = (name) => {
    if (name.length > 0) {
      this.props.fetchMineNameList({ name });
    }
  };

  handleChange = () => {
    this.props.fetchMineNameList();
  };

  render() {
    return (
      <div>
        <h3>Add BCeID User</h3>
        {this.props.mines && (
          <AddMinespaceUser
            mines={this.props.mines.map((mine) => ({
              value: `${mine.mine_name}~${mine.mine_guid}`,
              label: `${mine.mine_name}-${mine.mine_no}`,
            }))}
            onSubmit={this.createNewBCEIDUser}
            handleChange={this.handleChange}
            handleSearch={this.handleSearch}
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
      createMinespaceUser,
    },
    dispatch
  );

NewMinespaceUser.propTypes = propTypes;
NewMinespaceUser.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewMinespaceUser);

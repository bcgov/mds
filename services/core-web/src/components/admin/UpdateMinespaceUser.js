import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getMineNames } from "@common/selectors/mineSelectors";
import { fetchMineNameList } from "@common/actionCreators/mineActionCreator";

import CustomPropTypes from "@/customPropTypes";
import EditMinespaceUser from "@/components/Forms/EditMinespaceUser";

const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mineName),
  minespaceUserEmailHash: PropTypes.objectOf(PropTypes.any),
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

const defaultProps = {
  mines: [],
  minespaceUserEmailHash: {},
};

export class UpdateMinespaceUser extends Component {

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
        <h3>Edit Proponent</h3>
        {this.props.mines && (
          <EditMinespaceUser
            mines={this.props.mines.map((mine) => ({
              value: mine.mine_guid,
              label: `${mine.mine_name} - ${mine.mine_no}`,
            }))}
            initialValues={{
              ...this.props.initialValues,
              mine_guids: this.props.initialValues.mineNames.map((mn) => mn.mine_guid),
            }}
            minespaceUserEmailHash={this.props.minespaceUserEmailHash}
            onSubmit={this.props.handleSubmit}
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
    },
    dispatch
  );

UpdateMinespaceUser.propTypes = propTypes;
UpdateMinespaceUser.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(UpdateMinespaceUser);

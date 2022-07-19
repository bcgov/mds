import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getMineNames } from "@common/selectors/mineSelectors";
import { fetchMineNameList } from "@common/actionCreators/mineActionCreator";

import CustomPropTypes from "@/customPropTypes";
import EditMinespaceUser from "@/components/Forms/EditMinespaceUser";
import { getMinespaceUserMines } from "@common/reducers/minespaceReducer";

const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mineName),
  minespaceUserEmailHash: PropTypes.objectOf(PropTypes.any),
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  minespaceUserMines: PropTypes.arrayOf(CustomPropTypes.mineName),
};

const defaultProps = {
  mines: [],
  minespaceUserEmailHash: {},
  minespaceUserMines: [],
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

  parseMinesAsOptions = (mines) => {
    return mines.map((mine) => ({
      value: mine.mine_guid,
      label: `${mine.mine_name} - ${mine.mine_no}`,
    }));
  };

  filterUserMines = () => {
    if (this.props.initialValues.mineNames) {
      const userMines = this.props.initialValues.mineNames.map((mn) => mn.mine_guid);
      return userMines.map((mine) => {
        return this.props.minespaceUserMines.find((m) => m.mine_guid === mine);
      });
    }
    return [];
  };

  render() {
    return (
      <div>
        <h3>Edit Proponent</h3>
        {this.props.mines && (
          <EditMinespaceUser
            mines={this.parseMinesAsOptions([...this.props.mines, ...this.filterUserMines()])}
            initalValueOptions={this.props.initialValues.mineNames}
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
  minespaceUserMines: getMinespaceUserMines(state),
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

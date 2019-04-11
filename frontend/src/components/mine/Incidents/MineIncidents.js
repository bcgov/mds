import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { fetchMineIncidents } from "@/actionCreators/mineActionCreator";
import { getMineIncidents } from "@/selectors/mineSelectors";

/**
 * @class  MineTailingsInfo - all tenure information related to the mine.
 */

const propTypes = {
  mineGuid: CustomPropTypes.mine.isRequired,
  mineIncidents: PropTypes.arrayOf(CustomPropTypes.incident),
};

const defaultProps = {
  mineIncidents: [],
};

export class MineIncidents extends Component {
  componentDidMount() {
    fetchMineIncidents(this.props.mineGuid);
  }

  render() {
    return <div>Num of incidents: {this.props.mineIncidents.length}</div>;
  }
}

const mapStateToProps = (state) => ({
  mineIncidents: getMineIncidents(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineIncidents,
    },
    dispatch
  );

MineIncidents.propTypes = propTypes;
MineIncidents.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineIncidents);

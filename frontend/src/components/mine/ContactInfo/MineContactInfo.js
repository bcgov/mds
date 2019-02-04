import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { debounce } from "lodash";
import ViewPartyRelationships from "./ViewPartyRelationships";
import { openModal, closeModal } from "@/actions/modalActions";
import { createParty, fetchParties } from "@/actionCreators/partiesActionCreator";
import { fetchMineRecordById } from "@/actionCreators/mineActionCreator";
import CustomPropTypes from "@/customPropTypes";

/**
 * @class MineContactInfo.js contains all information under the 'Contact Information' tab on the MnieDashboard - houses all the redux logic/state and passes props into children,;
 */

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  fetchParties: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
};

export class MineContactInfo extends Component {
  constructor(props) {
    super(props);
    this.handleChangeDebounced = debounce(this.handleChange, 1000);
  }

  componentWillMount() {
    this.props.fetchParties();
  }

  handleChange = (value) => {
    this.props.fetchParties(value);
  };

  render() {
    return (
      <div>
        <ViewPartyRelationships {...this.props} handleChange={this.handleChangeDebounced} />
      </div>
    );
  }
}

MineContactInfo.propTypes = propTypes;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchParties,
      createParty,
      fetchMineRecordById,
      openModal,
      closeModal,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps
)(MineContactInfo);

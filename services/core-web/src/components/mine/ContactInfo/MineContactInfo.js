import React, { Component } from "react";
import PropTypes from "prop-types";
import { Divider } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { debounce } from "lodash";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { createParty, fetchParties } from "@mds/common/redux/actionCreators/partiesActionCreator";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getMines, getMineGuid } from "@mds/common/redux/selectors/mineSelectors";
import CustomPropTypes from "@/customPropTypes";
import ViewPartyRelationships from "./ViewPartyRelationships";

/**
 * @class MineContactInfo.js contains all information under the 'Contact Information' tab on the MineDashboard - houses all the redux logic/state and passes props into children.
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  fetchParties: PropTypes.func.isRequired,
  createParty: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
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
    this.props.fetchParties({ name_search: value });
  };

  render() {
    const mine = this.props.mines[this.props.mineGuid];
    return (
      <div className="tab__content">
        <div>
          <h2>Contacts</h2>
          <Divider />
        </div>
        <ViewPartyRelationships
          mine={mine}
          {...this.props}
          handleChange={this.handleChangeDebounced}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  mineGuid: getMineGuid(state),
});

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

MineContactInfo.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineContactInfo);

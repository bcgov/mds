import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button } from "antd";
import { openModal, closeModal } from "@/actions/modalActions";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import { fetchParties, fetchPartyRelationshipTypes } from "@/actionCreators/partiesActionCreator";
import {
  getParties,
  getPartyIds,
  getPartyRelationshipTypeHash,
  getPartyRelationships,
} from "@/selectors/partiesSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import ContactList from "@/components/dashboard/contactsHomePage/ContactList";

/**
 * @class MineLandingPage is the main landing page of the application, currently contains a List and Map View, ability to create a new mine, and search for a mine by name or lat/long.
 *
 */

const propTypes = {
  fetchParties: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  parties: PropTypes.objectOf(CustomPropTypes.party).isRequired,
  partyIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export class Dashboard extends Component {
  componentDidMount() {
    this.props.fetchParties();
    this.props.fetchPartyRelationshipTypes();
  }

  render() {
    console.log(this.props.parties);
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <div className="inline-flex between center-mobile center-mobile">
            <div>
              <h1>Contact Lookup</h1>
              <p>To find a contact profile, search in the list section below.</p>
            </div>
            <div>
              <AuthorizationWrapper permission={Permission.ADMIN}>
                <Button type="primary">Create Contact Record</Button>
              </AuthorizationWrapper>
            </div>
          </div>
        </div>
        <div className="landing-page__content">
          <div className="tab__content ">
            <ContactList {...this.props} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  parties: getParties(state),
  partyIds: getPartyIds(state),
  partyRelationshipTypeHash: getPartyRelationshipTypeHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchParties,
      fetchPartyRelationshipTypes,
      openModal,
      closeModal,
    },
    dispatch
  );

Dashboard.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);

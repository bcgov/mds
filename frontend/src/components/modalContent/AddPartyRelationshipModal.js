import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import AddPartyRelationshipForm from "@/components/Forms/AddPartyRelationshipForm";
import AddPartyForm from "@/components/Forms/AddPartyForm";
import * as ModalContent from "@/constants/modalContent";
import { getParties, getPartyIds } from "@/selectors/partiesSelectors";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  onPartySubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  partyType: PropTypes.string.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired,
};

const defaultProps = {
  title: "",
  partyType: "",
  parties: {},
  partyIds: [],
};

export class AddPartyRelationshipModal extends Component {
  render() {
    return (
      <div>
        <AddPartyRelationshipForm {...this.props} />
        <p className="center">{ModalContent.PERSON_NOT_FOUND}</p>
        <AddPartyForm onSubmit={this.props.onPartySubmit} isPerson />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    parties: getParties(state),
    partyIds: getPartyIds(state),
  };
};

AddPartyRelationshipModal.propTypes = propTypes;
AddPartyRelationshipModal.defaultProps = defaultProps;
export default connect(
  mapStateToProps,
  null
)(AddPartyRelationshipModal);

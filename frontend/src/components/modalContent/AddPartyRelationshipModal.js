import React, { Component } from "react";
import { Radio } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import AddPartyRelationshipForm from "@/components/Forms/PartyRelationships/AddPartyRelationshipForm";
import AddPartyForm from "@/components/Forms/AddPartyForm";
import * as ModalContent from "@/constants/modalContent";
import { getRawParties } from "@/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import { createItemMap, createItemIdsArray } from "@/utils/helpers";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  onPartySubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  partyRelationshipType: CustomPropTypes.partyRelationshipType.isRequired,
  parties: PropTypes.arrayOf(CustomPropTypes.party),
  mine: CustomPropTypes.mine.isRequired,
};

const defaultProps = {
  parties: [],
};

export class AddPartyRelationshipModal extends Component {
  state = { isPerson: true };

  componentDidMount() {
    this.setState({ isPerson: this.props.partyRelationshipType.person });
  }

  togglePartyChange = (value) => {
    this.setState({ isPerson: value.target.value });
  };

  handlePartySubmit = (values) => {
    const type = this.state.isPerson ? "PER" : "ORG";
    this.props.onPartySubmit(values, type);
  };

  renderRadioButtonGroup = (person, organization) =>
    person &&
    organization && (
      <Radio.Group defaultValue size="large" onChange={this.togglePartyChange}>
        <Radio.Button value>Person</Radio.Button>
        <Radio.Button value={false}>Company</Radio.Button>
      </Radio.Group>
    );

  render() {
    let filteredParties = this.props.parties;
    if (!this.props.partyRelationshipType.person) {
      filteredParties = filteredParties.filter(({ party_type_code }) => party_type_code === "ORG");
    } else if (!this.props.partyRelationshipType.organization) {
      filteredParties = filteredParties.filter(({ party_type_code }) => party_type_code === "PER");
    }

    return (
      <div>
        <AddPartyRelationshipForm
          onSubmit={this.props.onSubmit}
          handleChange={this.props.handleChange}
          closeModal={this.props.closeModal}
          onPartySubmit={this.props.onPartySubmit}
          title={this.props.title}
          partyRelationshipType={this.props.partyRelationshipType}
          parties={createItemMap(filteredParties, "party_guid")}
          partyIds={createItemIdsArray(filteredParties, "party_guid")}
          mine={this.props.mine}
        />
        <br />
        <p className="center">
          {this.props.partyRelationshipType.person &&
            this.props.partyRelationshipType.organization &&
            ModalContent.PARTY_NOT_FOUND}
          {!this.props.partyRelationshipType.person &&
            this.props.partyRelationshipType.organization &&
            ModalContent.COMPANY_NOT_FOUND}
          {this.props.partyRelationshipType.person &&
            !this.props.partyRelationshipType.organization &&
            ModalContent.PERSON_NOT_FOUND}
        </p>
        <div className="center">
          {this.renderRadioButtonGroup(
            this.props.partyRelationshipType.person,
            this.props.partyRelationshipType.organization
          )}
          <AddPartyForm onSubmit={this.handlePartySubmit} isPerson={this.state.isPerson} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  parties: getRawParties(state),
});

AddPartyRelationshipModal.propTypes = propTypes;
AddPartyRelationshipModal.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  null
)(AddPartyRelationshipModal);

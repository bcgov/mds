import React, { Component } from "react";
import { Radio } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import AddPartyRelationshipForm from "@/components/Forms/PartyRelationships/AddPartyRelationshipForm";
import AddPartyForm from "@/components/Forms/AddPartyForm";
import * as ModalContent from "@/constants/modalContent";
import { getParties, getPartyIds } from "@/selectors/partiesSelectors";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  onPartySubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  partyRelationshipType: PropTypes.object.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired,
  mine: PropTypes.object.isRequired,
};

export class AddPartyRelationshipModal extends Component {
  state = { isPerson: true };

  componentDidMount() {
    this.setState({ isPerson: this.props.partyRelationshipType.person === "True" });
  }

  togglePartyChange = (value) => {
    this.setState({ isPerson: value.target.value });
  };

  handlePartySubmit = (values) => {
    const type = this.state.isPerson ? "PER" : "ORG";
    this.props.onPartySubmit(values, type);
  };

  renderRadioButtonGroup = (person, organization) =>
    person === "True" &&
    organization === "True" && (
      <Radio.Group defaultValue size="large" onChange={this.togglePartyChange}>
        <Radio.Button value>Person</Radio.Button>
        <Radio.Button value={false}>Company</Radio.Button>
      </Radio.Group>
    );

  render() {
    return (
      <div>
        <AddPartyRelationshipForm {...this.props} />
        <br />
        <p className="center">
          {this.props.partyRelationshipType.person === "True" &&
            this.props.partyRelationshipType.organization === "True" &&
            ModalContent.PARTY_NOT_FOUND}
          {this.props.partyRelationshipType.person === "False" &&
            this.props.partyRelationshipType.organization === "True" &&
            ModalContent.COMPANY_NOT_FOUND}
          {this.props.partyRelationshipType.person === "True" &&
            this.props.partyRelationshipType.organization === "False" &&
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
  parties: getParties(state),
  partyIds: getPartyIds(state),
});

AddPartyRelationshipModal.propTypes = propTypes;
export default connect(
  mapStateToProps,
  null
)(AddPartyRelationshipModal);

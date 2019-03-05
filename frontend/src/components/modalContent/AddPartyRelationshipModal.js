import React, { Component } from "react";
import { Radio, Button, Icon, Row, Col, Divider } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import AddPartyRelationshipForm from "@/components/Forms/PartyRelationships/AddPartyRelationshipForm";
import AddQuickPartyForm from "@/components/Forms/parties/AddQuickPartyForm";
import * as ModalContent from "@/constants/modalContent";
import { getRawParties } from "@/selectors/partiesSelectors";
import * as Styles from "@/constants/styles";
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
  state = { isPerson: true, isFormVisible: false };

  componentDidMount() {
    this.setState({ isPerson: this.props.partyRelationshipType.person });
  }

  togglePartyChange = (value) => {
    this.setState({ isPerson: value.target.value });
  };

  toggleFormVisibility = () => {
    this.setState({ isFormVisible: !this.state.isFormVisible });
  };

  handlePartySubmit = (values) => {
    const type = this.state.isPerson ? "PER" : "ORG";
    this.toggleFormVisibility();
    return this.props.onPartySubmit(values, type);
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
        <Row gutter={48}>
          <Col md={12} sm={24} style={{ margin: "40px 0" }}>
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
          </Col>
          <Col md={12} sm={24}>
            {!this.state.isFormVisible && (
              <div className="center" style={{ position: "relative", top: "100px" }}>
                <p>
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
                <Button className="btn--dropdown" onClick={this.toggleFormVisibility}>
                  <Icon type="plus" style={{ color: Styles.COLOR.violet }} />
                  Add new Contact
                </Button>
              </div>
            )}
            {this.state.isFormVisible && (
              <div className="center">
                {this.renderRadioButtonGroup(
                  this.props.partyRelationshipType.person,
                  this.props.partyRelationshipType.organization
                )}
                <AddQuickPartyForm
                  onSubmit={this.handlePartySubmit}
                  isPerson={this.state.isPerson}
                />
              </div>
            )}
          </Col>
        </Row>
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

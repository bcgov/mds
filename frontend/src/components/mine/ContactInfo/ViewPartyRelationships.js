import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import * as CustomPropTypes from "@/types";
import { Card, Row, Col, Button, Menu, Icon, Popconfirm } from "antd";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import { ConditionalButton } from "@/components/common/ConditionalButton";
import { DefaultContact } from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";
import { EngineerOfRecord } from "@/components/mine/ContactInfo/PartyRelationships/EngineerOfRecord";
import NullScreen from "@/components/common/NullScreen";

import {
  fetchPartyRelationshipTypes,
  addPartyRelationship,
  fetchPartyRelationships,
  removePartyRelationship,
  updatePartyRelationship,
} from "@/actionCreators/partiesActionCreator";
import { getPartyRelationshipTypes, getPartyRelationships } from "@/selectors/partiesSelectors";

const propTypes = {
  mine: PropTypes.object.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem),
  selectedPartyRelationshipType: CustomPropTypes.dropdownListItem,
  addPartyRelationship: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  selectedPartyRelationship: PropTypes.object,
};

export class ViewPartyRelationships extends Component {
  state = { selectedPartyRelationshipType: {}, selectedPartyRelationship: {} };

  componentWillMount() {
    this.props.fetchPartyRelationshipTypes();
    this.props.fetchPartyRelationships(this.props.mine.guid);
  }

  onSubmitAddPartyRelationship = (values) => {
    const payload = {
      mine_guid: this.props.mine.guid,
      party_guid: values.party_guid,
      mine_party_appt_type_code: this.state.selectedPartyRelationshipType,
      mine_tailings_storage_facility_guid: values.mine_tailings_storage_facility_guid,
      start_date: values.start_date,
      end_date: values.end_date,
    };

    this.props.addPartyRelationship(payload).then(() => {
      this.props.fetchPartyRelationships(this.props.mine.guid);
      this.props.closeModal();
    });
  };

  onPartySubmit = (values) => {
    this.props.handlePartySubmit(values, ModalContent.PERSON);
  };

  openAddPartyRelationshipModal = (value, onSubmit, handleChange, onPartySubmit, title, mine) => {
    if (!this.props.partyRelationshipTypes) return;
    this.props.openModal({
      props: {
        onSubmit,
        handleChange,
        onPartySubmit,
        title: `${title}: ${
          this.props.partyRelationshipTypes.find((x) => x.value === value).label
        }`,
        partyRelationshipType: value,
        mine,
      },
      content: modalConfig.ADD_PARTY_RELATIONSHIP,
    });
  };

  openEditPartyRelationshipModal = (partyRelationship, onSubmit, handleChange, mine) => {
    if (!this.props.partyRelationshipTypes) return;
    this.setState({
      selectedPartyRelationship: partyRelationship,
    });
    this.props.openModal({
      props: {
        onSubmit,
        handleChange,
        title: `Update ${
          this.props.partyRelationshipTypes.find(
            (x) => x.value === partyRelationship.mine_party_appt_type_code
          ).label
        }: ${partyRelationship.party.name}`,
        partyRelationship,
        mine,
      },
      content: modalConfig.EDIT_PARTY_RELATIONSHIP,
    });
  };

  onSubmitEditPartyRelationship = (values) => {
    const payload = this.state.selectedPartyRelationship;

    payload.start_date = values.start_date;
    payload.end_date = values.end_date;
    payload.mine_tailings_storage_facility_guid = values.mine_tailings_storage_facility_guid;

    this.props.updatePartyRelationship(payload).then(() => {
      this.props.fetchPartyRelationships(this.props.mine.guid);
      this.props.closeModal();
    });
  };

  removePartyRelationship = (event, mine_party_appt_guid) => {
    event.preventDefault();
    this.props.removePartyRelationship(mine_party_appt_guid).then(() => {
      this.props.fetchPartyRelationships(this.props.mine.guid);
    });
  };

  renderPartyRelationship = (partyRelationship) => {
    if (!this.props.partyRelationshipTypes) return;

    const partyRelationshipTypeLabel = this.props.partyRelationshipTypes.find(
      (x) => x.value === partyRelationship.mine_party_appt_type_code
    ).label;

    switch (partyRelationship.mine_party_appt_type_code) {
      case "EOR":
        return (
          <EngineerOfRecord
            partyRelationship={partyRelationship}
            partyRelationshipTypeLabel={partyRelationshipTypeLabel}
            handleChange={this.props.handleChange}
            mine={this.props.mine}
            openEditPartyRelationshipModal={this.openEditPartyRelationshipModal}
            onSubmitEditPartyRelationship={this.onSubmitEditPartyRelationship}
            removePartyRelationship={this.removePartyRelationship}
          />
        );
      default:
        return (
          <DefaultContact
            partyRelationship={partyRelationship}
            partyRelationshipTypeLabel={partyRelationshipTypeLabel}
            handleChange={this.props.handleChange}
            mine={this.props.mine}
            openEditPartyRelationshipModal={this.openEditPartyRelationshipModal}
            onSubmitEditPartyRelationship={this.onSubmitEditPartyRelationship}
            removePartyRelationship={this.removePartyRelationship}
          />
        );
    }
  };

  render() {
    const { partyRelationships, partyRelationshipTypes } = this.props;

    const menu = (
      <Menu>
        {partyRelationshipTypes.map((value) => (
          <Menu.Item key={value.value}>
            <button
              className="full"
              onClick={(event) => {
                this.setState({
                  selectedPartyRelationshipType: value.value,
                });
                this.openAddPartyRelationshipModal(
                  value.value,
                  this.onSubmitAddPartyRelationship,
                  this.props.handleChange,
                  this.onPartySubmit,
                  ModalContent.ADD_CONTACT,
                  this.props.mine
                );
              }}
            >
              <Icon type="plus-circle" /> &nbsp;
              {"Add " + value.label}
            </button>
          </Menu.Item>
        ))}
      </Menu>
    );

    return (
      <div>
        <Card>
          <Row gutter={16}>
            <Col span={24}>
              <div className="inline-flex between">
                <h3>Other Contacts</h3>
                <ConditionalButton
                  isDropdown
                  overlay={menu}
                  string={<Icon type="ellipsis" theme="outlined" style={{ fontSize: "30px" }} />}
                />
              </div>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              {partyRelationships.length != 0 ? (
                partyRelationships.map((partyRelationship) => (
                  <div key={partyRelationship.mine_party_appt_guid}>
                    <hr />
                    <br />
                    {this.renderPartyRelationship(partyRelationship)}
                    <br />
                    <br />
                  </div>
                ))
              ) : (
                <div>
                  <hr />
                  <br />
                  <br />
                  <NullScreen type="contacts" />
                  <br />
                  <br />
                </div>
              )}
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  partyRelationshipTypes: getPartyRelationshipTypes(state),
  partyRelationships: getPartyRelationships(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyRelationshipTypes,
      addPartyRelationship,
      fetchPartyRelationships,
      removePartyRelationship,
      updatePartyRelationship,
    },
    dispatch
  );

ViewPartyRelationships.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewPartyRelationships);

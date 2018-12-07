import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Card, Row, Col, Button, Menu, Icon, Popconfirm } from "antd";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import { ConditionalButton } from "@/components/common/ConditionalButton";
import { GREEN_PENCIL } from "@/constants/assets";

import {
  fetchPartyRelationshipTypes,
  addPartyRelationship,
  fetchPartyRelationships,
  removePartyRelationship,
} from "@/actionCreators/partiesActionCreator";
import { getPartyRelationshipTypes, getPartyRelationships } from "@/selectors/partiesSelectors";

const propTypes = {
  mine: PropTypes.object.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  partyRelationshipTypes: PropTypes.array,
  selectedPartyRelationshipType: PropTypes.object,
  addPartyRelationship: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  partyRelationships: PropTypes.array,
};

export class ViewPartyRelationships extends Component {
  state = { selectedPartyRelationshipType: {} };

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
    this.props.openModal({
      props: {
        onSubmit,
        handleChange,
        onPartySubmit,
        title: `${title}: ${
          this.props.partyRelationshipTypes.find((x) => x.value === value).label
        }`,
        partyType: value,
        mine,
      },
      content: modalConfig.ADD_PARTY_RELATIONSHIP,
    });
  };

  openEditPartyRelationshipModal = (partyRelationship, onSubmit, handleChange, mine) => {
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
    this.props.fetchPartyRelationships(this.props.mine.guid);
    this.props.closeModal();
  };

  removePartyRelationship = (event, mine_party_appt_guid) => {
    event.preventDefault();
    this.props.removePartyRelationship(mine_party_appt_guid).then(() => {
      this.props.fetchPartyRelationships(this.props.mine.guid);
    });
  };

  renderPartyRelationship = (partyRelationship) => {
    const partyRelationshipTypeLabel = this.props.partyRelationshipTypes.find(
      (x) => x.value === partyRelationship.mine_party_appt_type_code
    ).label;

    switch (partyRelationship.mine_party_appt_type_code) {
      case "EOR":
        return (
          <div key={partyRelationship.mine_party_appt_guid}>
            <div className="inline-flex between">
              <div>
                <h4>
                  {partyRelationshipTypeLabel + " - "}
                  {
                    this.props.mine.mine_tailings_storage_facility.find(
                      (x) =>
                        x.mine_tailings_storage_facility_guid ===
                        partyRelationship.mine_tailings_storage_facility_guid
                    ).mine_tailings_storage_facility_name
                  }
                </h4>
                <Icon type="clock-circle" />
                &nbsp;&nbsp;
                {partyRelationship.start_date === "None"
                  ? "Unknown"
                  : partyRelationship.start_date}{" "}
                - {partyRelationship.end_date === "None" ? "Present" : partyRelationship.end_date}
                <br />
                <br />
              </div>
              <div>
                <Button
                  key={partyRelationship.mine_party_appt_guid + "_edit"}
                  ghost
                  type="primary"
                  onClick={(event) =>
                    this.openEditPartyRelationshipModal(
                      partyRelationship,
                      this.onSubmitEditPartyRelationship,
                      this.props.handleChange,
                      this.props.mine
                    )
                  }
                >
                  <img style={{ padding: "5px" }} src={GREEN_PENCIL} />
                </Button>
                <Popconfirm
                  key={partyRelationship.mine_party_appt_guid + "_delete"}
                  placement="topLeft"
                  title={`Are you sure you want to delete this ${partyRelationshipTypeLabel}?`}
                  onConfirm={(event) =>
                    this.removePartyRelationship(event, partyRelationship.mine_party_appt_guid)
                  }
                  okText="Delete"
                  cancelText="Cancel"
                >
                  <Button ghost type="primary">
                    <Icon type="minus-circle" theme="outlined" />
                  </Button>
                </Popconfirm>
              </div>
            </div>
            <h5 className="bold">{partyRelationship.party.name}</h5>
            <Icon type="mail" />
            &nbsp;&nbsp;
            {partyRelationship.party.email}&nbsp;&nbsp;&nbsp;&nbsp;
            <br />
            <Icon type="phone" />
            &nbsp;&nbsp;
            {partyRelationship.party.phone_no}{" "}
            {partyRelationship.party.phone_ext ? "x" + partyRelationship.party.phone_ext : ""}
          </div>
        );
      default:
        return (
          <div key={partyRelationship.mine_party_appt_guid}>
            <h4>{partyRelationshipTypeLabel}</h4>
            <Icon type="clock-circle" />
            &nbsp;&nbsp;
            {partyRelationship.start_date === "None"
              ? "Unknown"
              : partyRelationship.start_date} -{" "}
            {partyRelationship.end_date === "None" ? "Present" : partyRelationship.end_date}
            <br />
            <br />
            <h5 className="bold">{partyRelationship.party.name}</h5>
            <Icon type="mail" />
            &nbsp;&nbsp;
            {partyRelationship.party.email}&nbsp;&nbsp;&nbsp;&nbsp;
            <br />
            <Icon type="phone" />
            &nbsp;&nbsp;
            {partyRelationship.party.phone_no}{" "}
            {partyRelationship.party.phone_ext ? "x" + partyRelationship.party.phone_ext : ""}
          </div>
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
              {partyRelationships.map((partyRelationship) => (
                <div>
                  <hr />
                  <br />
                  {this.renderPartyRelationship(partyRelationship)}
                  <br />
                  <br />
                </div>
              ))}
            </Col>
          </Row>
          <br />
          <Row gutter={16}>
            <Col span={6}>
              <h3 />
            </Col>
            <Col span={6}>
              <h3 />
            </Col>
            <Col span={6}>
              <h3 />
            </Col>
            <Col span={6}>
              <h3 />
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
    },
    dispatch
  );

ViewPartyRelationships.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewPartyRelationships);

import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { Card, Row, Col, Menu, Icon, Popconfirm } from "antd";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import { ConditionalButton } from "@/components/common/ConditionalButton";
import { DefaultContact } from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";
import { EngineerOfRecord } from "@/components/mine/ContactInfo/PartyRelationships/EngineerOfRecord";
import NullScreen from "@/components/common/NullScreen";

import {
  fetchPartyRelationshipTypes,
  addPartyRelationship,
  fetchPartyRelationshipsByMineId,
  removePartyRelationship,
  updatePartyRelationship,
} from "@/actionCreators/partiesActionCreator";
import { createTailingsStorageFacility } from "@/actionCreators/mineActionCreator";
import { getPartyRelationshipTypes, getPartyRelationships } from "@/selectors/partiesSelectors";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem),
  addPartyRelationship: PropTypes.func.isRequired,
  fetchPartyRelationshipsByMineId: PropTypes.func.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  createTailingsStorageFacility: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updatePartyRelationship: PropTypes.func.isRequired,
  removePartyRelationship: PropTypes.func.isRequired,
};

const defaultProps = {
  partyRelationshipTypes: [],
  partyRelationships: [],
};

export class ViewPartyRelationships extends Component {
  constructor(props) {
    super(props);
    this.TSFConfirmation = React.createRef();
  }

  state = { selectedPartyRelationshipType: {}, selectedPartyRelationship: {} };

  componentWillMount() {
    this.props.fetchPartyRelationshipTypes();
    this.props.fetchPartyRelationshipsByMineId(this.props.mine.guid);
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
      this.props.fetchPartyRelationshipsByMineId(this.props.mine.guid);
      this.props.closeModal();
    });
  };

  onPartySubmit = (values) => {
    this.props.handlePartySubmit(values, ModalContent.PERSON);
  };

  openAddPartyRelationshipModal = (value, onSubmit, handleChange, onPartySubmit, title, mine) => {
    if (!this.props.partyRelationshipTypes) return;

    if (value === "EOR") {
      if (mine.mine_tailings_storage_facility.length === 0) {
        this.TSFConfirmation.current.click();
        return;
      }
    }

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

  handleAddTailings = (value) => {
    this.props
      .createTailingsStorageFacility({
        ...value,
        mine_guid: this.props.mine.guid,
      })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.guid);
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
      this.props.fetchPartyRelationshipsByMineId(this.props.mine.guid);
      this.props.closeModal();
    });
  };

  removePartyRelationship = (event, mine_party_appt_guid) => {
    event.preventDefault();
    this.props.removePartyRelationship(mine_party_appt_guid).then(() => {
      this.props.fetchPartyRelationshipsByMineId(this.props.mine.guid);
    });
  };

  openTailingsModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title },
      content: modalConfig.ADD_TAILINGS,
    });
  }

  renderPartyRelationship = (partyRelationship) => {
    if (!this.props.partyRelationshipTypes) return <div />;

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
    const menu = (
      <Menu>
        {this.props.partyRelationshipTypes.map((value) => (
          <Menu.Item key={value.value}>
            <button
              className="full"
              type="button"
              onClick={() => {
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
              {`Add ${value.label}`}
            </button>
          </Menu.Item>
        ))}
      </Menu>
    );

    return (
      <div>
        <Row gutter={16}>
          <Col span={24}>
            <div className="inline-flex between">
              <h3>Contact Information</h3>
              <div className="inline-flex between">
                <Popconfirm
                  placement="topRight"
                  title="There are currently no tailings storage facilities for this mine. Would you like to create one?"
                  onConfirm={(event) =>
                    this.openTailingsModal(event, this.handleAddTailings, ModalContent.ADD_TAILINGS)
                  }
                  okText="Yes"
                  cancelText="No"
                >
                  <input
                    type="button"
                    ref={this.TSFConfirmation}
                    style={{ width: "1px", height: "1px" }}
                  />
                </Popconfirm>
                <ConditionalButton
                  isDropdown
                  overlay={menu}
                  string={<Icon type="ellipsis" theme="outlined" style={{ fontSize: "30px" }} />}
                />
              </div>
            </div>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            {this.props.partyRelationships.length !== 0 ? (
              this.props.partyRelationships.map((partyRelationship) => (
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
      fetchPartyRelationshipsByMineId,
      removePartyRelationship,
      updatePartyRelationship,
      createTailingsStorageFacility,
    },
    dispatch
  );

ViewPartyRelationships.propTypes = propTypes;
ViewPartyRelationships.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewPartyRelationships);

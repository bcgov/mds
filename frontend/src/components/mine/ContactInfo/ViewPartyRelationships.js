import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { Row, Col, Menu, Icon, Popconfirm, Divider } from "antd";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import { ConditionalButton } from "@/components/common/ConditionalButton";
import { Contact } from "@/components/mine/ContactInfo/PartyRelationships/Contact";
import { InactiveContact } from "@/components/mine/ContactInfo/PartyRelationships/InactiveContact";
import NullScreen from "@/components/common/NullScreen";
import Loading from "@/components/common/Loading";

import {
  fetchPartyRelationshipTypes,
  addPartyRelationship,
  fetchPartyRelationshipsByMineId,
  removePartyRelationship,
  updatePartyRelationship,
} from "@/actionCreators/partiesActionCreator";
import { createTailingsStorageFacility } from "@/actionCreators/mineActionCreator";
import {
  getPartyRelationshipTypes,
  getPartyRelationshipTypesList,
  getPartyRelationships,
} from "@/selectors/partiesSelectors";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePartySubmit: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  partyRelationshipTypes: PropTypes.object,
  partyRelationshipTypesList: PropTypes.arrayOf(CustomPropTypes.dropdownListItem),
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
  partyRelationshipTypesList: [],
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
      related_guid: values.related_guid,
      start_date: values.start_date,
      end_date: values.end_date,
    };

    this.props.addPartyRelationship(payload).then(() => {
      this.props.fetchPartyRelationshipsByMineId(this.props.mine.guid);
      this.props.closeModal();
    });
  };

  onPartySubmit = (values, type) => {
    this.props.handlePartySubmit(values, type);
  };

  openAddPartyRelationshipModal = (value, onSubmit, handleChange, onPartySubmit, title, mine) => {
    if (!this.props.partyRelationshipTypesList) return;

    if (value.mine_party_appt_type_code === "EOR") {
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
        title: `${title}: ${value.description}`,
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
    if (!this.props.partyRelationshipTypesList) return;
    this.setState({
      selectedPartyRelationship: partyRelationship,
    });
    this.props.openModal({
      props: {
        onSubmit,
        handleChange,
        title: `Update ${
          this.props.partyRelationshipTypesList.find(
            (x) => x.value === partyRelationship.mine_party_appt_type_code
          ).label
        }: ${partyRelationship.party.name}`,
        partyRelationship: JSON.parse(JSON.stringify(partyRelationship)),
        mine,
      },
      content: modalConfig.EDIT_PARTY_RELATIONSHIP,
    });
  };

  onSubmitEditPartyRelationship = (values) => {
    const payload = this.state.selectedPartyRelationship;

    payload.start_date = values.start_date;
    payload.end_date = values.end_date;
    payload.related_guid = values.related_guid;

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

  renderInactiveRelationships = (partyRelationships) => {
    const activeRelationships = partyRelationships.filter(
      (x) =>
        x.end_date === "None" ||
        (Date.parse(x.end_date) >= new Date() &&
          (x.start_date === "None" || Date.parse(x.start_date) <= new Date()))
    );
    const inactiveRelationships = partyRelationships.filter(
      (x) =>
        x.end_date !== "None" &&
        (Date.parse(x.end_date) <= new Date() ||
          (x.start_date !== "None" && Date.parse(x.start_date) >= new Date()))
    );

    const activePartyRelationshipTypes = [
      ...new Set(activeRelationships.map((x) => x.mine_party_appt_type_code)),
    ];
    const inactivePartyRelationshipTypes = [
      ...new Set(inactiveRelationships.map((x) => x.mine_party_appt_type_code)),
    ];

    return inactivePartyRelationshipTypes
      .filter((x) => !activePartyRelationshipTypes.includes(x))
      .map((typeCode) => (
        <Col xs={24} sm={24} md={24} lg={12} xl={8} xxl={6} key={typeCode}>
          <br />
          <InactiveContact
            partyRelationshipTypeCode={typeCode}
            partyRelationshipTypeLabel={
              this.props.partyRelationshipTypesList.find((x) => x.value === typeCode).label
            }
            mine={this.props.mine}
          />
          <br />
          <br />
        </Col>
      ));
  };

  getGroupTitle = (group) => {
    switch (group) {
      case "3":
        return "Key Contacts";
      case "2":
        return "Specialists";
      default:
        return "Other Contacts";
    }
  };

  openTailingsModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title },
      content: modalConfig.ADD_TAILINGS,
    });
  }

  renderMenu = (partyRelationshipGroupingLevels) => (
    <Menu>
      {partyRelationshipGroupingLevels.map((group) => [
        this.props.partyRelationshipTypes
          .filter((x) => x.grouping_level === group)
          .map((value) => (
            <Menu.Item key={value.mine_party_appt_type_code}>
              <button
                className="full"
                type="button"
                onClick={() => {
                  this.setState({
                    selectedPartyRelationshipType: value.mine_party_appt_type_code,
                  });
                  this.openAddPartyRelationshipModal(
                    value,
                    this.onSubmitAddPartyRelationship,
                    this.props.handleChange,
                    this.onPartySubmit,
                    ModalContent.ADD_CONTACT,
                    this.props.mine
                  );
                }}
              >
                {`${value.description}`}
              </button>
            </Menu.Item>
          )),
        <Menu.Divider key={group} />,
      ])}
    </Menu>
  );

  renderPartyRelationship = (partyRelationship) => {
    if (
      !this.props.partyRelationshipTypesList.length > 0 ||
      !this.props.partyRelationshipTypes.length > 0
    )
      return <div />;

    const partyRelationshipTypeLabel = this.props.partyRelationshipTypesList.find(
      (x) => x.value === partyRelationship.mine_party_appt_type_code
    ).label;

    return (
      <Col
        xs={24}
        sm={24}
        md={12}
        lg={12}
        xl={8}
        xxl={6}
        key={partyRelationship.mine_party_appt_guid}
      >
        <br />
        <Contact
          partyRelationship={partyRelationship}
          partyRelationshipTypeLabel={partyRelationshipTypeLabel}
          handleChange={this.props.handleChange}
          mine={this.props.mine}
          openEditPartyRelationshipModal={this.openEditPartyRelationshipModal}
          onSubmitEditPartyRelationship={this.onSubmitEditPartyRelationship}
          removePartyRelationship={this.removePartyRelationship}
        />
        <br />
        <br />
      </Col>
    );
  };

  renderPartyRelationshipGroup = (partyRelationships, group) => {
    const partyRelationshipTypesInGroup = this.props.partyRelationshipTypes.filter(
      (x) => x.grouping_level === group
    );
    const partyRelationshipsInGroup = partyRelationships.filter((x) =>
      partyRelationshipTypesInGroup.some(
        (y) => y.mine_party_appt_type_code == x.mine_party_appt_type_code
      )
    );

    return (
      partyRelationshipsInGroup.length !== 0 && [
        <Row gutter={16}>
          <Col span={24}>
            <h2>{this.getGroupTitle(group)}</h2>
            <Divider />
          </Col>
        </Row>,

        <Row gutter={16}>
          {partyRelationshipsInGroup
            .filter(
              (x) =>
                x.end_date === "None" ||
                (Date.parse(x.end_date) >= new Date() &&
                  (x.start_date === "None" || Date.parse(x.start_date) <= new Date()))
            )
            .map((partyRelationship) => this.renderPartyRelationship(partyRelationship))}
          {this.renderInactiveRelationships(partyRelationshipsInGroup)}
        </Row>,
        <div>
          <br />
          <br />
        </div>,
      ]
    );
  };

  render() {
    if (
      !this.props.partyRelationshipTypesList.length > 0 ||
      !this.props.partyRelationshipTypes.length > 0
    )
      return <Loading />;

    const partyRelationshipGroupingLevels = [
      ...new Set(this.props.partyRelationshipTypes.map((x) => x.grouping_level)),
    ];

    return (
      <div>
        <div className="inline-flex between">
          <div />
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
              overlay={this.renderMenu(partyRelationshipGroupingLevels)}
              string={[
                <Icon type="plus-circle" theme="outlined" style={{ fontSize: "16px" }} />,
                "Add New Contact",
              ]}
            />
          </div>
        </div>
        <div>
          {partyRelationshipGroupingLevels.map((group) =>
            this.renderPartyRelationshipGroup(this.props.partyRelationships, group)
          )}
          {this.props.partyRelationships.length === 0 && (
            <div>
              <Divider />
              <br />
              <br />
              <NullScreen type="contacts" />
              <br />
              <br />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  partyRelationshipTypesList: getPartyRelationshipTypesList(state),
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

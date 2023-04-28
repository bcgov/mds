import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Row, Col, Menu, Popconfirm, Divider, Dropdown } from "antd";
import moment from "moment";
import { uniq, uniqBy } from "lodash";
import {
  addPartyRelationship,
  removePartyRelationship,
  updatePartyRelationship,
  fetchPartyRelationships,
  addDocumentToRelationship,
} from "@common/actionCreators/partiesActionCreator";
import { createTailingsStorageFacility } from "@common/actionCreators/mineActionCreator";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import {
  getPartyRelationshipTypes,
  getPartyRelationshipTypesList,
} from "@common/selectors/staticContentSelectors";

import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common";
import { getPermits } from "@common/selectors/permitSelectors";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { Contact } from "@/components/mine/ContactInfo/PartyRelationships/Contact";
import { InactiveContact } from "@/components/mine/ContactInfo/PartyRelationships/InactiveContact";
import NullScreen from "@/components/common/NullScreen";
import Loading from "@/components/common/Loading";
import AddButton from "@/components/common/buttons/AddButton";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  partyRelationshipTypes: PropTypes.arrayOf(CustomPropTypes.partyRelationshipType),
  partyRelationshipTypesList: PropTypes.arrayOf(CustomPropTypes.dropdownListItem),
  addPartyRelationship: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  createTailingsStorageFacility: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updatePartyRelationship: PropTypes.func.isRequired,
  removePartyRelationship: PropTypes.func.isRequired,
  addDocumentToRelationship: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit),
};

const defaultProps = {
  partyRelationshipTypes: [],
  partyRelationshipTypesList: [],
  partyRelationships: [],
  permits: [],
};

export class ViewPartyRelationships extends Component {
  constructor(props) {
    super(props);
    this.RoleConfirmation = React.createRef();
    this.state = {
      selectedPartyRelationshipType: {},
      selectedPartyRelationship: {},
      uploadedFiles: [],
    };
  }

  onFileLoad = (documentName, document_manager_guid) => {
    this.setState((prevState) => ({
      uploadedFiles: [[document_manager_guid, documentName], ...prevState.uploadedFiles],
    }));
  };

  onRemoveFile = (err, fileItem) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter((fileArr) => fileArr[0] !== fileItem.serverId),
    }));
  };

  onSubmitAddPartyRelationship = (values) => {
    const payload = this.formatValuesEndCurrent({
      mine_guid: this.props.mine.mine_guid,
      mine_party_appt_type_code: this.state.selectedPartyRelationshipType,
      party_guid: values.party_guid,
      related_guid: values.related_guid,
      start_date: values.start_date,
      end_date: values.end_date,
      end_current: values.end_current,
      union_rep_company: values.union_rep_company,
    });

    return this.props
      .addPartyRelationship(payload)
      .then(async ({ data: { mine_party_appt_guid } }) => {
        await Promise.all(
          this.state.uploadedFiles.map(([document_manager_guid, document_name]) =>
            this.props.addDocumentToRelationship(
              { mineGuid: this.props.mine.mine_guid, minePartyApptGuid: mine_party_appt_guid },
              {
                document_manager_guid,
                document_name,
              }
            )
          )
        );
        this.setState({ uploadedFiles: [] });
        this.props.closeModal();
        this.props.fetchPartyRelationships({
          mine_guid: this.props.mine.mine_guid,
          relationships: "party",
          include_permit_contacts: "true",
        });
      });
  };

  openAddPartyRelationshipModal = ({
    value,
    partyRelationships,
    onSubmit,
    handleChange,
    onPartySubmit,
    title,
    mine,
  }) => {
    if (!this.props.partyRelationshipTypesList) return;

    if (
      value.mine_party_appt_type_code === "PMT" &&
      !this.props.userRoles.includes(USER_ROLES[Permission.CONTACT_ADMIN])
    ) {
      this.RoleConfirmation.current.click();
      return;
    }

    if (value.mine_party_appt_type_code === "EOR") {
      if (mine.mine_tailings_storage_facilities.length === 0) {
        this.RoleConfirmation.current.click();
        return;
      }
    }
    this.props.openModal({
      props: {
        onSubmit,
        handleChange,
        onPartySubmit,
        title: `${title}: ${value.description}`,
        partyRelationships,
        partyRelationshipType: value,
        mine,
        minePermits: this.props.permits,
        onFileLoad: this.onFileLoad,
        onRemoveFile: this.onRemoveFile,
      },
      content: modalConfig.ADD_PARTY_RELATIONSHIP,
      clearOnSubmit: true,
    });
  };

  handleAddTailings = (values) =>
    this.props.createTailingsStorageFacility(this.props.mine.mine_guid, values).then(() => {
      this.props.closeModal();
      this.props.fetchMineRecordById(this.props.mine.mine_guid);
    });

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
            ({ value }) => value === partyRelationship.mine_party_appt_type_code
          ).label
        }: ${partyRelationship.party.name}`,
        partyRelationships: this.props.partyRelationships,
        partyRelationship: JSON.parse(JSON.stringify(partyRelationship)),
        partyRelationshipType: this.props.partyRelationshipTypes.find(
          ({ mine_party_appt_type_code }) =>
            mine_party_appt_type_code === partyRelationship.mine_party_appt_type_code
        ),
        minePermits: this.props.permits,
        mine,
      },
      content: modalConfig.EDIT_PARTY_RELATIONSHIP,
    });
  };

  formatValuesEndCurrent = (values) => {
    let end_current = values.end_current ?? true;
    if (values.end_date) {
      const endDate = new Date(values.end_date);
      endDate.setTime(endDate.getTime() + endDate.getTimezoneOffset() * 60000);
      end_current = endDate >= new Date();
    }
    return { ...values, end_current };
  };

  onSubmitEditPartyRelationship = (values) => {
    let payload = this.state.selectedPartyRelationship;

    payload.start_date = values.start_date;
    payload.end_date = values.end_date;
    payload.union_rep_company = values.union_rep_company;
    payload.related_guid = values.related_guid || payload.related_guid;

    payload = this.formatValuesEndCurrent(payload);

    return this.props.updatePartyRelationship(payload).then(() => {
      this.props.fetchPartyRelationships({
        mine_guid: this.props.mine.mine_guid,
        relationships: "party",
        include_permit_contacts: "true",
      });
      this.props.closeModal();
    });
  };

  removePartyRelationship = (event, mine_party_appt_guid) => {
    event.preventDefault();
    this.props.removePartyRelationship(mine_party_appt_guid).then(() => {
      this.props.fetchPartyRelationships({
        mine_guid: this.props.mine.mine_guid,
        relationships: "party",
        include_permit_contacts: "true",
      });
    });
  };

  // Since end date is stored at yyyy-mm-dd, comparing current Date() to
  // the the start of the next day ensures appointments ending today are displayed.
  renderInactiveRelationships = (partyRelationships) => {
    const activeRelationships = partyRelationships.filter(
      (x) =>
        (!x.end_date || moment(x.end_date).add(1, "days") > new Date()) &&
        (!x.start_date || Date.parse(x.start_date) <= new Date())
    );
    const inactiveRelationships = partyRelationships.filter(
      (x) => !activeRelationships.includes(x)
    );

    const activePartyRelationshipTypes = uniqBy(
      activeRelationships,
      "mine_party_appt_type_code"
    ).map((x) => x.mine_party_appt_type_code);

    const inactivePartyRelationshipTypes = uniqBy(
      inactiveRelationships,
      "mine_party_appt_type_code"
    ).map((x) => x.mine_party_appt_type_code);

    return inactivePartyRelationshipTypes
      .filter((x) => !activePartyRelationshipTypes.includes(x))
      .map((typeCode) => (
        <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} key={typeCode}>
          <InactiveContact
            partyRelationshipTypeCode={typeCode}
            partyRelationshipTitle={
              this.props.partyRelationshipTypesList.find((x) => x.value === typeCode).label
            }
            mine={this.props.mine}
          />
        </Col>
      ));
  };

  getGroupTitle = (group) => {
    switch (group) {
      case 3:
        return "MAIN CONTACTS";
      case 2:
        return "SPECIALISTS";
      default:
        return "OTHER CONTACTS";
    }
  };

  renderMenu = (partyRelationshipGroupingLevels, isAbandonedMines) => (
    <Menu>
      {partyRelationshipGroupingLevels.map((group) => [
        this.props.partyRelationshipTypes
          .filter((x) => x.grouping_level === group)
          .filter((x) => x.mine_party_appt_type_code !== "AGT")
          .filter(
            (x) =>
              isAbandonedMines ||
              (x.mine_party_appt_type_code !== "DAM" && x.mine_party_appt_type_code !== "CCS")
          )
          .map((value) => (
            <Menu.Item key={value.mine_party_appt_type_code}>
              <button
                className="full"
                type="button"
                onClick={() => {
                  this.setState({
                    selectedPartyRelationshipType: value.mine_party_appt_type_code,
                  });
                  this.openAddPartyRelationshipModal({
                    value,
                    partyRelationships: this.props.partyRelationships,
                    onSubmit: this.onSubmitAddPartyRelationship,
                    handleChange: this.props.handleChange,
                    onPartySubmit: this.onPartySubmit,
                    title: ModalContent.ADD_CONTACT,
                    mine: this.props.mine,
                  });
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
      this.props.partyRelationshipTypesList.length <= 0 ||
      this.props.partyRelationshipTypes.length <= 0
    )
      return <div />;

    const partyRelationshipTitle = this.props.partyRelationshipTypesList.find(
      ({ value }) => value === partyRelationship.mine_party_appt_type_code
    ).label;

    return (
      <Col
        key={partyRelationship.mine_party_appt_guid}
        xs={24}
        sm={24}
        md={12}
        lg={12}
        xl={8}
        xxl={6}
      >
        <Contact
          partyRelationship={partyRelationship}
          partyRelationshipTitle={partyRelationshipTitle}
          handleChange={this.props.handleChange}
          mine={this.props.mine}
          permits={this.props.permits}
          openEditPartyRelationshipModal={this.openEditPartyRelationshipModal}
          onSubmitEditPartyRelationship={this.onSubmitEditPartyRelationship}
          removePartyRelationship={this.removePartyRelationship}
          isEditable
        />
      </Col>
    );
  };

  renderPartyRelationshipGroup = (partyRelationships, group) => {
    const filteredPartyRelationships = partyRelationships
      .filter(
        (x) =>
          (!x.end_date || moment(x.end_date).add(1, "days") > new Date()) &&
          (!x.start_date || Date.parse(x.start_date) <= new Date())
      )
      .filter((partyRelationship) => partyRelationship.mine_party_appt_type_code !== "PMT")
      .concat(
        this.props.permits
          .map(
            (permit) =>
              partyRelationships
                .filter(
                  (x) =>
                    (!x.end_date || moment(x.end_date).add(1, "days") > new Date()) &&
                    (!x.start_date || Date.parse(x.start_date) <= new Date())
                )
                .filter(
                  (partyRelationship) =>
                    partyRelationship.mine_party_appt_type_code === "PMT" &&
                    permit.permit_guid === partyRelationship.related_guid
                )
                .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0]
          )
          .filter((x) => x)
      );
    const partyRelationshipTypesInGroup = this.props.partyRelationshipTypes.filter(
      (x) => x.grouping_level === group
    );
    const partyRelationshipsInGroup = filteredPartyRelationships.filter((x) =>
      partyRelationshipTypesInGroup.some(
        (y) => y.mine_party_appt_type_code === x.mine_party_appt_type_code
      )
    );

    return (
      partyRelationshipsInGroup.length !== 0 && [
        <Row gutter={16}>
          <Col span={24}>
            <h4>{this.getGroupTitle(group)}</h4>
            <Divider />
          </Col>
        </Row>,

        <Row gutter={16}>
          {partyRelationshipsInGroup.map((partyRelationship) =>
            this.renderPartyRelationship(partyRelationship)
          )}
          {this.renderInactiveRelationships(partyRelationshipsInGroup)}
        </Row>,
        <div>
          <br />
          <br />
        </div>,
      ]
    );
  };

  confirmationProps = (selectedPartyRelationshipType) =>
    ({
      EOR: {
        title:
          "There are currently no tailings storage facilities for this mine. Would you like to create one?",
        okText: "Yes",
        cancelText: "No",
        onConfirm: (event) =>
          this.openTailingsModal(event, this.handleAddTailings, ModalContent.ADD_TAILINGS),
      },
      PMT: {
        title:
          'Please add the permit or permit amendment under the "Permit" tab to change the permittee. Would you like to go there now?',
        okText: "Ok",
        cancelText: "Cancel",
        onConfirm: () =>
          this.props.history.push(router.MINE_SUMMARY.dynamicRoute(this.props.mine.mine_guid)),
      },
    }[selectedPartyRelationshipType]);

  openTailingsModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title },
      content: modalConfig.ADD_TAILINGS,
    });
  }

  render() {
    if (
      !this.props.partyRelationshipTypesList.length > 0 ||
      !this.props.partyRelationshipTypes.length > 0
    )
      return <Loading />;

    const partyRelationshipGroupingLevels = [
      ...uniq(this.props.partyRelationshipTypes.map(({ grouping_level }) => grouping_level)),
    ];
    const isAbandonedMines = this.props.userRoles.includes(USER_ROLES[Permission.ABANDONED_MINES]);
    return (
      <div>
        <div className="inline-flex between">
          <div />
          <div className="inline-flex between">
            <Popconfirm
              placement="topRight"
              {...this.confirmationProps(this.state.selectedPartyRelationshipType)}
            >
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <button
                type="button"
                ref={this.RoleConfirmation}
                style={{ width: "1px", height: "1px" }}
              />
            </Popconfirm>
            <AuthorizationWrapper permission={Permission.EDIT_MINES}>
              <Dropdown
                className="full-height"
                overlay={this.renderMenu(partyRelationshipGroupingLevels, isAbandonedMines)}
                placement="bottomLeft"
              >
                <div>
                  <AddButton>Add New Contact</AddButton>
                </div>
              </Dropdown>
            </AuthorizationWrapper>
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
  userRoles: getUserAccessData(state),
  permits: getPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      addPartyRelationship,
      fetchPartyRelationships,
      removePartyRelationship,
      updatePartyRelationship,
      createTailingsStorageFacility,
      addDocumentToRelationship,
    },
    dispatch
  );

ViewPartyRelationships.propTypes = propTypes;
ViewPartyRelationships.defaultProps = defaultProps;

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewPartyRelationships));

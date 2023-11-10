import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Tabs, Button, Popconfirm } from "antd";
import {
  PhoneOutlined,
  MinusCircleOutlined,
  MailOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { uniq, isEmpty } from "lodash";
import {
  fetchPartyById,
  updateParty,
  deleteParty,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { fetchMineBasicInfoList } from "@mds/common/redux/actionCreators/mineActionCreator";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { getParties } from "@mds/common/redux/selectors/partiesSelectors";
import { getMineBasicInfoListHash } from "@mds/common/redux/selectors/mineSelectors";
import {
  getDropdownProvinceOptions,
  getPartyRelationshipTypeHash,
  getPartyBusinessRoleOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { formatDate, dateSorter, formatSnakeCaseToSentenceCase } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import { EDIT } from "@/constants/assets";
import { modalConfig } from "@/components/modalContent/config";
import Loading from "@/components/common/Loading";
import * as routes from "@/constants/routes";
import * as ModalContent from "@/constants/modalContent";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import CustomPropTypes from "@/customPropTypes";
import Address from "@/components/common/Address";
import CoreTable from "@/components/common/CoreTable";
import { Feature, VC_CONNECTION_STATES, isFeatureEnabled } from "@mds/common";

/**
 * @class PartyProfile - profile view for personnel/companies
 */

const propTypes = {
  fetchPartyById: PropTypes.func.isRequired,
  fetchMineBasicInfoList: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  updateParty: PropTypes.func.isRequired,
  deleteParty: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  parties: PropTypes.arrayOf(CustomPropTypes.party).isRequired,
  partyRelationshipTypeHash: PropTypes.objectOf(PropTypes.strings),
  partyBusinessRoleOptionsHash: PropTypes.objectOf(PropTypes.strings),
  mineBasicInfoListHash: PropTypes.objectOf(PropTypes.strings),
  match: CustomPropTypes.match.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

const defaultProps = {
  partyRelationshipTypeHash: {},
  mineBasicInfoListHash: {},
  partyBusinessRoleOptionsHash: {},
};

export class PartyProfile extends Component {
  state = { isLoaded: false, deletingParty: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchPartyById(id).then(() => {
      const mine_guids = uniq(
        this.props.parties[id].mine_party_appt
          .filter((x) => x.mine_guid !== "None")
          .map(({ mine_guid }) => mine_guid)
      );
      this.props.fetchMineBasicInfoList(mine_guids).then(() => {
        this.setState({ isLoaded: true });
      });
    });
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.match !== this.props.match) {
      const { id } = nextProps.match.params;
      this.props.fetchPartyById(id);
    }
  };

  openEditPartyModal = (event, partyGuid, onSubmit, title, provinceOptions) => {
    event.preventDefault();
    this.props.openModal({
      props: { partyGuid, onSubmit, title, provinceOptions },
      content: modalConfig.EDIT_PARTY,
      width: "75vw",
      clearOnSubmit: false,
    });
  };

  editParty = (values) => {
    const { id } = this.props.match.params;
    return this.props.updateParty(values, id).then(() => {
      this.props.fetchPartyById(id);
      this.props.closeModal();
    });
  };

  deleteParty = () => {
    const { id } = this.props.match.params;
    this.setState({ deletingParty: true });
    this.props
      .deleteParty(id)
      .then(() => {
        this.props.history.push(
          routes.CONTACT_HOME_PAGE.dynamicRoute({
            page: String.DEFAULT_PAGE,
            per_page: String.DEFAULT_PER_PAGE,
          })
        );
      })
      .finally(() => this.setState({ deletingParty: false }));
  };

  render() {
    const { id } = this.props.match.params;
    const party = this.props.parties[id];
    const columns = [
      {
        title: "Name",
        dataIndex: "mineName",
        render: (text, record) => {
          if (record.relationship.mine_party_appt_type_code === "PMT") {
            return <div title="Permit No">{record.relationship.permit_no}</div>;
          }
          if (record.relationship.party_business_role_code === "INS") {
            return "N/A";
          }
          if (record.relationship.party_business_role_code === "PRL") {
            return "N/A";
          }
          if (record.relationship.mine_party_appt_type_code === "AGT") {
            return (
              <div title="NoW Number">
                <Link
                  to={routes.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
                    record.relationship.now_application.now_application_guid,
                    "application"
                  )}
                >
                  {record.relationship.now_application.now_number}
                </Link>
              </div>
            );
          }
          return (
            <div title="Mine Name">
              <Link to={routes.MINE_CONTACTS.dynamicRoute(record.mineGuid)}>{text}</Link>
            </div>
          );
        },
      },
      {
        title: "Role",
        dataIndex: "role",
        render: (text) => <div title="Role">{text}</div>,
      },
      {
        title: "Dates",
        dataIndex: "dates",
        sorter: dateSorter("startDate"),
        defaultSortOrder: "descend",
        render: (text, record) => (
          <div title="Dates">
            {record.startDate} - {record.endDate}
          </div>
        ),
      },
    ];

    const transformRowData = (partyRelationships) =>
      partyRelationships.map((relationship) => ({
        key: relationship.mine_party_appt_guid,
        mineGuid: relationship.mine_guid,
        mineName: this.props.mineBasicInfoListHash[relationship.mine_guid],
        role: this.props.partyRelationshipTypeHash[relationship.mine_party_appt_type_code],
        endDate: formatDate(relationship.end_date) || "Present",
        startDate: formatDate(relationship.start_date) || "Unknown",
        relationship,
      }));

    const transformBusinessRoleRowData = (businessPartyRecord) =>
      businessPartyRecord.map((record) => ({
        key: record.party_business_role_appt_id,
        role: this.props.partyBusinessRoleOptionsHash[record.party_business_role_code],
        endDate: formatDate(record.end_date) || "Present",
        startDate: formatDate(record.start_date) || "Unknown",
        relationship: { party_business_role_code: record.party_business_role_code },
      }));

    const transformNOWRoleRowData = (NOWPartyRecords) => {
      return NOWPartyRecords.map((record) => ({
        key: record.now_party_appointment_id,
        role: this.props.partyRelationshipTypeHash[record.mine_party_appt_type_code],
        endDate: formatDate(record.end_date) || "Present",
        startDate: formatDate(record.now_application.submitted_date) || "Unknown",
        relationship: record,
      }));
    };

    if (this.state.isLoaded && party) {
      return (
        <div className="profile">
          <div className="profile__header">
            <div className="inline-flex between">
              <h1>{party.name}</h1>
              <div>
                <AuthorizationWrapper permission={Permission.ADMIN}>
                  <Popconfirm
                    className="delete_contact_warning"
                    placement="bottom"
                    title={
                      <div>
                        <p>Are you sure you want to delete the party &apos;{party.name}&apos;?</p>
                        <p>Doing so will permanently remove the party and all associated roles.</p>
                      </div>
                    }
                    onConfirm={this.deleteParty}
                    okText="Yes"
                    cancelText="No"
                    disabled={this.state.deletingParty}
                  >
                    <Button type="danger" disabled={this.state.deletingParty}>
                      <MinusCircleOutlined className="btn-danger--icon" />
                      Delete Party
                    </Button>
                  </Popconfirm>
                </AuthorizationWrapper>
                <AuthorizationWrapper permission={Permission.EDIT_PARTIES}>
                  <Button
                    type="primary"
                    onClick={(event) =>
                      this.openEditPartyModal(
                        event,
                        party.party_guid,
                        this.editParty,
                        ModalContent.EDIT_PARTY(party.name),
                        this.props.provinceOptions
                      )
                    }
                    disabled={this.state.deletingParty}
                  >
                    <img alt="pencil" className="padding-sm--right" src={EDIT} />
                    Update Contact
                  </Button>
                </AuthorizationWrapper>
              </div>
            </div>
            {!isEmpty(party.party_orgbook_entity) && (
              <div className="inline-flex">
                <div className="padding-right">
                  <CheckCircleOutlined className="icon-sm" />
                </div>
                <p>
                  <a
                    href={routes.ORGBOOK_ENTITY_URL(party.party_orgbook_entity.registration_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Verified OrgBook Entity
                  </a>
                </p>
              </div>
            )}
            <div className="inline-flex">
              <div className="padding-right">
                <MailOutlined className="icon-sm" />
              </div>
              {party.email && party.email !== "Unknown" ? (
                <a href={`mailto:${party.email}`}>{party.email}</a>
              ) : (
                <p>{Strings.EMPTY_FIELD}</p>
              )}
            </div>
            <div className="inline-flex">
              <div className="padding-right">
                <PhoneOutlined className="icon-sm" />
              </div>
              <p>
                {party.phone_no} {party.phone_ext ? `x${party.phone_ext}` : ""}
              </p>
            </div>
            <div className="inline-flex">
              <div className="padding-right">
                <Address address={party.address[0] || {}} />
              </div>
            </div>
            <div className="inline-flex">
              <div className="padding-right">
                <EditOutlined className="icon-sm" />
              </div>
              {party.signature ? (
                <img
                  src={party.signature}
                  alt="Signature"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                  height={120}
                />
              ) : (
                <p>No Signature Provided</p>
              )}
            </div>
            {isFeatureEnabled(Feature.VERIFIABLE_CREDENTIALS) && (
              <div className="padding-md--top">
                Digital Wallet Connection Status:{" "}
                {VC_CONNECTION_STATES[party?.digital_wallet_connection_status]}
              </div>
            )}
          </div>
          <div className="profile__content">
            <Tabs
              activeKey="history"
              size="large"
              animated={{ inkBar: true, tabPane: false }}
              centered
            >
              <Tabs.TabPane tab="History" key="history">
                <div className="tab__content ">
                  <CoreTable
                    columns={columns}
                    dataSource={transformRowData(this.props.parties[id].mine_party_appt).concat(
                      transformBusinessRoleRowData(
                        this.props.parties[id].business_role_appts
                      ).concat(transformNOWRoleRowData(this.props.parties[id].now_party_appt))
                    )}
                  />
                </div>
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      );
    }
    return <Loading />;
  }
}

const mapStateToProps = (state) => ({
  parties: getParties(state),
  partyRelationshipTypeHash: getPartyRelationshipTypeHash(state),
  partyBusinessRoleOptionsHash: getPartyBusinessRoleOptionsHash(state),
  mineBasicInfoListHash: getMineBasicInfoListHash(state),
  provinceOptions: getDropdownProvinceOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyById,
      fetchMineBasicInfoList,
      deleteParty,
      updateParty,
      openModal,
      closeModal,
    },
    dispatch
  );

PartyProfile.propTypes = propTypes;
PartyProfile.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(PartyProfile);

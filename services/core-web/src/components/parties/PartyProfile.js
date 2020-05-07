import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Tabs, Icon, Table, Button, Popconfirm } from "antd";
import { uniq, isEmpty } from "lodash";
import {
  fetchPartyById,
  fetchPartyRelationships,
  updateParty,
  deleteParty,
} from "@common/actionCreators/partiesActionCreator";
import { fetchMineBasicInfoList } from "@common/actionCreators/mineActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getParties, getPartyRelationships } from "@common/selectors/partiesSelectors";
import { getMineBasicInfoListHash } from "@common/selectors/mineSelectors";
import {
  getDropdownProvinceOptions,
  getPartyRelationshipTypeHash,
} from "@common/selectors/staticContentSelectors";
import { formatTitleString, formatDate } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import { EDIT } from "@/constants/assets";
import { modalConfig } from "@/components/modalContent/config";
import Loading from "@/components/common/Loading";
import * as routes from "@/constants/routes";
import * as ModalContent from "@/constants/modalContent";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import CustomPropTypes from "@/customPropTypes";
import NullScreen from "@/components/common/NullScreen";
import Address from "@/components/common/Address";

/**
 * @class PartyProfile - profile view for personnel/companies
 */

const { TabPane } = Tabs;

const propTypes = {
  fetchPartyById: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  fetchMineBasicInfoList: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  updateParty: PropTypes.func.isRequired,
  deleteParty: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  parties: PropTypes.arrayOf(CustomPropTypes.party).isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  partyRelationshipTypeHash: PropTypes.objectOf(PropTypes.strings),
  mineBasicInfoListHash: PropTypes.objectOf(PropTypes.strings),
  match: CustomPropTypes.match.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

const defaultProps = {
  partyRelationships: [],
  partyRelationshipTypeHash: {},
  mineBasicInfoListHash: {},
};

export class PartyProfile extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchPartyById(id);
    this.props.fetchPartyRelationships({ party_guid: id, relationships: "party" }).then(() => {
      const mine_guids = uniq(this.props.partyRelationships.map(({ mine_guid }) => mine_guid));
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
    this.props.updateParty(values, id).then(() => {
      this.props.fetchPartyById(id);
      this.props.closeModal();
    });
  };

  deleteParty = () => {
    const { id } = this.props.match.params;
    this.props.deleteParty(id).then(() => {
      this.props.history.push(
        routes.CONTACT_HOME_PAGE.dynamicRoute({
          page: String.DEFAULT_PAGE,
          per_page: String.DEFAULT_PER_PAGE,
        })
      );
    });
  };

  render() {
    const { id } = this.props.match.params;
    const party = this.props.parties[id];
    const columns = [
      {
        title: "Mine Name",
        dataIndex: "mineName",
        render: (text, record) => (
          <div title="Mine Name">
            <Link to={routes.MINE_CONTACTS.dynamicRoute(record.mineGuid)}>{text}</Link>
          </div>
        ),
      },
      {
        title: "Role",
        dataIndex: "role",
        render: (text) => <div title="Role">{text}</div>,
      },
      {
        title: "Dates",
        dataIndex: "dates",
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
      }));

    if (this.state.isLoaded && party) {
      const formattedName = formatTitleString(party.name);
      return (
        <div className="profile">
          <div className="profile__header">
            <div className="inline-flex between">
              <h1>{formattedName}</h1>
              <div>
                <AuthorizationWrapper inTesting>
                  <AuthorizationWrapper permission={Permission.ADMIN}>
                    <Popconfirm
                      className="delete_contact_warning"
                      placement="bottom"
                      title={
                        <div>
                          <p>
                            Are you sure you want to delete the party &apos;{formattedName}&apos;?
                          </p>
                          <p>
                            Doing so will permanently remove the party and all associated roles.
                          </p>
                        </div>
                      }
                      onConfirm={this.deleteParty}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="danger">
                        <Icon className="btn-danger--icon" type="minus-circle" theme="outlined" />
                        Delete Party
                      </Button>
                    </Popconfirm>
                  </AuthorizationWrapper>
                </AuthorizationWrapper>
                <AuthorizationWrapper permission={Permission.EDIT_PARTIES}>
                  <Button
                    type="primary"
                    onClick={(event) =>
                      this.openEditPartyModal(
                        event,
                        party.party_guid,
                        this.editParty,
                        ModalContent.EDIT_PARTY(formattedName),
                        this.props.provinceOptions
                      )
                    }
                  >
                    <img alt="pencil" className="padding-small--right" src={EDIT} />
                    Update Party
                  </Button>
                </AuthorizationWrapper>
              </div>
            </div>
            {!isEmpty(party.party_orgbook_entity) && (
              <div className="inline-flex">
                <div className="padding-right">
                  <Icon type="check-circle" className="icon-sm" />
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
                <Icon type="mail" className="icon-sm" />
              </div>
              {party.email && party.email !== "Unknown" ? (
                <a href={`mailto:${party.email}`}>{party.email}</a>
              ) : (
                <p>{Strings.EMPTY_FIELD}</p>
              )}
            </div>
            <div className="inline-flex">
              <div className="padding-right">
                <Icon type="phone" className="icon-sm" />
              </div>
              <p>
                {party.phone_no} {party.phone_ext ? `x${party.phone_ext}` : ""}
              </p>
            </div>
            <Address address={party.address[0] || {}} />
          </div>
          <div className="profile__content">
            <Tabs
              className="center-tabs"
              activeKey="history"
              size="large"
              animated={{ inkBar: true, tabPane: false }}
            >
              <TabPane tab="History" key="history">
                <div className="tab__content ">
                  <Table
                    align="left"
                    pagination={false}
                    columns={columns}
                    dataSource={transformRowData(this.props.partyRelationships)}
                    locale={{ emptyText: <NullScreen type="no-results" /> }}
                  />
                </div>
              </TabPane>
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
  partyRelationships: getPartyRelationships(state),
  mineBasicInfoListHash: getMineBasicInfoListHash(state),
  provinceOptions: getDropdownProvinceOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyById,
      fetchPartyRelationships,
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

import React, { Component } from "react";
//import React, { FC, useEffect, useState, useRef } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider, Tabs } from "antd";
import {
  fetchPermits,
  createPermit,
  updatePermit,
  updatePermitAmendment,
  createPermitAmendment,
  createPermitAmendmentVC,
  removePermitAmendmentDocument,
  deletePermit,
  deletePermitAmendment,
} from "@common/actionCreators/permitActionCreator";
import { fetchPartyRelationships } from "@common/actionCreators/partiesActionCreator";
import { fetchMineRecordById, createMineTypes } from "@common/actionCreators/mineActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getPermits } from "@common/selectors/permitSelectors";
import { getMines, getMineGuid } from "@common/selectors/mineSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import ExplosivesPermit from "@/components/mine/ExplosivesPermit/ExplosivesPermit";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/buttons/AddButton";
import MinePermitTable from "@/components/mine/Permit/MinePermitTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { getExplosivesPermits } from "@common/selectors/explosivesPermitSelectors";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import { IPermit, IMine, IPermitPartyRelationship, IExplosivesPermit } from "@mds/common";
import { ActionCreator } from "@/interfaces/actionCreator";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const amalgamatedPermit = "ALG";
const originalPermit = "OGP";

interface MinePermitInfoProps {
  match: any;
  mines: IMine[];
  mineGuid: string;
  permits?: IPermit[];
  partyRelationships?: IPermitPartyRelationship[];
  fetchPartyRelationships: (arg1: any) => any;
  openModal: (arg1: any) => void;
  history: { push: (path: string) => void };
  closeModal: () => void;
  createPermit: ActionCreator<typeof createPermit>;
  fetchPermits: ActionCreator<typeof fetchPermits>;
  updatePermit: ActionCreator<typeof updatePermit>;
  updatePermitAmendment: ActionCreator<typeof updatePermitAmendment>;
  createPermitAmendment: ActionCreator<typeof createPermitAmendment>;
  createPermitAmendmentVC: ActionCreator<typeof createPermitAmendmentVC>;
  removePermitAmendmentDocument: ActionCreator<typeof removePermitAmendmentDocument>;
  fetchMineRecordById: (arg1: string) => Promise<any>;
  deletePermit: ActionCreator<typeof deletePermit>;
  deletePermitAmendment: ActionCreator<typeof deletePermitAmendment>;
  userRoles: string[];
  createMineTypes: (arg1: string, arg2: any) => Promise<any>;
  explosivesPermits: IExplosivesPermit[];
}

interface MinePermitInfoState {
  expandedRowKeys: any[];
  modifiedPermits: boolean;
  modifiedPermitGuid: any;
  isLoaded: boolean;
}

export class MinePermitInfo extends Component<MinePermitInfoProps, MinePermitInfoState> {
  constructor(props: MinePermitInfoProps) {
    super(props);
    this.state = {
      expandedRowKeys: [],
      modifiedPermits: false,
      modifiedPermitGuid: null,
      isLoaded: false,
    };
  }

  componentDidMount = () => {
    console.log("MinePermitInfo!");
    if (this.props.permits?.length === 0 || !this.props.mineGuid) {
      this.handleFetchData();
    } else {
      this.setState({ isLoaded: true });
    }
  };

  componentWillReceiveProps = (nextProps) => {
    if (this.state.modifiedPermits && nextProps.permits !== this.props.permits) {
      const currentPermits =
        this.props.permits &&
        this.props.permits
          .filter((p) => p.mine_guid === this.props.mineGuid)
          .map((x) => x.permit_guid);
      const nextPermits =
        nextProps.permits &&
        nextProps.permits
          .filter((p) => p.mine_guid === this.props.mineGuid)
          .map((x) => x.permit_guid);

      this.setState((prevState) => ({
        expandedRowKeys: prevState.modifiedPermitGuid
          ? [prevState.modifiedPermitGuid]
          : nextPermits.filter((key) => currentPermits.indexOf(key) === -1),
        modifiedPermitGuid: null,
      }));
    }
  };

  handleFetchData = () => {
    const { id } = this.props.match.params;
    return this.props.fetchMineRecordById(id).then(() => {
      this.props.fetchPermits(id);
      this.props.fetchPartyRelationships({
        mine_guid: id,
        relationships: "party",
        include_permit_contacts: "true",
      });
      this.setState({ isLoaded: true });
    });
  };

  closePermitModal = () => {
    this.props.closeModal();
    this.handleFetchData();
  };

  openAddPermitModal = (event, onSubmit, title) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: this.props.mineGuid,
        },
        onSubmit,
        title,
        mine_guid: this.props.mineGuid,
      },
      width: "50vw",
      content: modalConfig.ADD_PERMIT,
    });
  };

  openViewConditionModal = (event, conditions, amendmentNumber, permitNo) => {
    event.preventDefault();
    return this.props.openModal({
      props: {
        title: `${permitNo} - Permit Conditions for Amendment #${amendmentNumber}`,
        closeModal: this.props.closeModal,
        conditions,
      },
      width: "50vw",
      isViewOnly: true,
      content: modalConfig.VIEW_ALL_CONDITION_MODAL,
    });
  };

  openEditPermitModal = (event, permit) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: permit,
        onSubmit: this.handleEditPermit,
        title: `Edit Permit Status for ${permit.permit_no}`,
      },
      content: modalConfig.EDIT_PERMIT,
    });
  };

  openEditSitePropertiesModal = (event, permit) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: permit,
        permit,
        onSubmit: this.handleEditSiteProperties,
        title: `Edit Site Properties for ${permit.permit_no}`,
      },
      content: modalConfig.EDIT_SITE_PROPERTIES_MODAL,
    });
  };

  // Permit Handlers
  handleAddPermit = (values) => {
    const permit_no = values.is_exploration
      ? `${values.permit_type}X-${values.permit_no}`
      : `${values.permit_type}-${values.permit_no}`;
    const payload = { ...values, permit_no };

    this.setState({ modifiedPermits: true });

    return this.props.createPermit(this.props.mineGuid, payload).then((data) => {
      const siteProperties = { ...values.site_properties, permit_guid: data.data.permit_guid };
      this.props.createMineTypes(this.props.mineGuid, [siteProperties]).then(this.closePermitModal);
    });
  };

  handleEditPermit = (values) => {
    // we do not need to provide site_properties on status update as it will fail if the site_properties are empty
    delete values.site_properties;
    return this.props
      .updatePermit(this.props.mineGuid, values.permit_guid, values)
      .then(this.closePermitModal);
  };

  handleEditSiteProperties = (values) => {
    return this.props
      .updatePermit(this.props.mineGuid, values.permit_guid, values)
      .then(this.closePermitModal);
  };

  handleDeletePermit = (permitGuid) =>
    this.props.deletePermit(this.props.mineGuid, permitGuid).then(() => this.closePermitModal());

  // Amendment Modals
  openAddAmendmentModal = (event, onSubmit, title, permit, type) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: this.props.mineGuid,
          permit_guid: permit.permit_guid,
          permit_amendment_type_code: type,
          amendments: permit.permit_amendments,
          permit_prefix: permit.permit_prefix,
        },
        onSubmit,
        title,
        mine_guid: this.props.mineGuid,
        amendments: permit.permit_amendments,
      },
      width: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    });
  };

  openAddHistoricalAmendmentModal = (event, onSubmit, title, permit, type) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          mine_guid: this.props.mineGuid,
          permit_guid: permit.permit_guid,
          permit_amendment_type_code: type,
          amendments: permit.permit_amendments,
          is_historical_amendment: true,
          userRoles: this.props.userRoles,
          permit_prefix: permit.permit_prefix,
        },
        onSubmit,
        title,
        is_historical_amendment: true,
        mine_guid: this.props.mineGuid,
        amendments: permit.permit_amendments,
      },
      width: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    });
  };

  openEditAmendmentModal = (event, permit_amendment, permit) => {
    event.preventDefault();
    const originalPermitAmendment = permit.permit_amendments.filter(
      (x) => x.permit_amendment_type_code === originalPermit
    )[0];
    this.props.openModal({
      props: {
        initialValues: {
          ...permit_amendment,
          amendments: permit.permit_amendments,
          userRoles: this.props.userRoles,
          is_historical_amendment:
            originalPermitAmendment &&
            originalPermitAmendment.issue_date > permit_amendment.issue_date,
          permit_prefix: permit.permit_prefix,
        },
        onSubmit: this.handleEditPermitAmendment,
        title:
          permit_amendment.permit_amendment_type_code === originalPermit
            ? `Edit Initial Permit for ${permit.permit_no}`
            : `Edit Permit Amendment for ${permit.permit_no}`,
        mine_guid: this.props.mineGuid,
        isMajorMine: this.props.mines[this.props.mineGuid].major_mine_ind,
        permit_guid: permit.permit_guid,
        handleRemovePermitAmendmentDocument: this.handleRemovePermitAmendmentDocument,
      },
      width: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    });
  };

  openAddAmalgamatedPermitModal = (event, permit) =>
    this.openAddAmendmentModal(
      event,
      this.handleAddAmalgamatedPermit,
      `Add Amalgamated Permit to ${permit.permit_no}`,
      permit,
      amalgamatedPermit
    );

  openAddPermitAmendmentModal = (event, permit) =>
    this.openAddAmendmentModal(
      event,
      this.handleAddPermitAmendment,
      `Add Permit Amendment to ${permit.permit_no}`,
      permit,
      null
    );

  openAddPermitHistoricalAmendmentModal = (event, permit) =>
    this.openAddHistoricalAmendmentModal(
      event,
      this.handleAddPermitAmendment,
      `Add Permit Historical Amendment to ${permit.permit_no}`,
      permit,
      null
    );

  // Amendment Handlers
  handleEditPermitAmendment = (values) =>
    this.props
      .updatePermitAmendment(
        this.props.mineGuid,
        values.permit_guid,
        values.permit_amendment_guid,
        values
      )
      .then(this.closePermitModal);

  handleAddPermitAmendment = (values) => {
    this.setState({ modifiedPermits: true, modifiedPermitGuid: values.permit_guid });
    return this.props
      .createPermitAmendment(this.props.mineGuid, values.permit_guid, values)
      .then(this.closePermitModal);
  };

  handleAddAmalgamatedPermit = (values) => {
    this.setState({ modifiedPermits: true, modifiedPermitGuid: values.permit_guid });
    return this.props
      .createPermitAmendment(this.props.mineGuid, values.permit_guid, {
        ...values,
        permit_amendment_type_code: amalgamatedPermit,
      })
      .then(this.closePermitModal);
  };

  handlePermitAmendmentIssueVC = (event, permit_amendment, permit) => {
    event.preventDefault();
    return this.props.createPermitAmendmentVC(
      this.props.mineGuid,
      permit.permitGuid,
      permit_amendment.permit_amendment_guid
    );
  };

  handleRemovePermitAmendmentDocument = (permitGuid, permitAmendmentGuid, documentGuid) =>
    this.props
      .removePermitAmendmentDocument(
        this.props.mineGuid,
        permitGuid,
        permitAmendmentGuid,
        documentGuid
      )
      .then(() => {
        this.props.fetchPermits(this.props.mineGuid);
      });

  handleDeletePermitAmendment = (record) =>
    this.props
      .deletePermitAmendment(
        this.props.mineGuid,
        record.permit.permit_guid,
        record.permit_amendment_guid
      )
      .then(() => this.closePermitModal());

  onExpand = (expanded, record) =>
    this.setState((prevState) => {
      const expandedRowKeys = expanded
        ? prevState.expandedRowKeys.concat(record.key)
        : prevState.expandedRowKeys.filter((key) => key !== record.key);
      return { expandedRowKeys };
    });

  render() {
    const mine = this.props.mines[this.props.mineGuid];
    return (
      <div className="tab__content">
        <div>
          <h2>Permits</h2>
          <Divider />
        </div>
        {/* @ts-ignore */}
        <Tabs type="card" style={{ textAlign: "left !important" }}>
          <Tabs.TabPane tab={`Mines Act Permits (${this.props.permits?.length | 0})`} key="1">
            <>
              <br />
              <div>
                <div className="inline-flex between">
                  <h4 className="uppercase">Mines Act Permits</h4>
                  <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                    <AddButton
                      onClick={(event) =>
                        this.openAddPermitModal(
                          event,
                          this.handleAddPermit,
                          `${ModalContent.ADD_PERMIT} to ${mine.mine_name}`
                        )
                      }
                    >
                      Add a New Permit
                    </AddButton>
                  </AuthorizationWrapper>
                </div>
              </div>
              <MinePermitTable
                isLoaded={this.state.isLoaded}
                permits={this.props.permits}
                partyRelationships={this.props.partyRelationships}
                major_mine_ind={mine.major_mine_ind}
                openEditPermitModal={this.openEditPermitModal}
                openEditAmendmentModal={this.openEditAmendmentModal}
                openEditSitePropertiesModal={this.openEditSitePropertiesModal}
                openAddPermitAmendmentModal={this.openAddPermitAmendmentModal}
                openAddPermitHistoricalAmendmentModal={this.openAddPermitHistoricalAmendmentModal}
                openAddAmalgamatedPermitModal={this.openAddAmalgamatedPermitModal}
                handlePermitAmendmentIssueVC={this.handlePermitAmendmentIssueVC}
                expandedRowKeys={this.state.expandedRowKeys}
                onExpand={this.onExpand}
                handleDeletePermit={this.handleDeletePermit}
                handleDeletePermitAmendment={this.handleDeletePermitAmendment}
                openViewConditionModal={this.openViewConditionModal}
              />
            </>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={`Explosives Storage & Use Permits (${
              this.props.explosivesPermits.filter(
                ({ application_status }) => application_status === "APP"
              ).length
            })`}
            key="2"
          >
            <>
              <ExplosivesPermit isPermitTab />
            </>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  permits: getPermits(state),
  mines: getMines(state),
  mineGuid: getMineGuid(state),
  userRoles: getUserAccessData(state),
  explosivesPermits: getExplosivesPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPermits,
      createPermit,
      updatePermit,
      updatePermitAmendment,
      createPermitAmendment,
      createPermitAmendmentVC,
      removePermitAmendmentDocument,
      fetchPartyRelationships,
      fetchMineRecordById,
      openModal,
      closeModal,
      deletePermit,
      deletePermitAmendment,
      createMineTypes,
    },
    dispatch
  );

// MinePermitInfo.propTypes = propTypes;
// MinePermitInfo.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MinePermitInfo);

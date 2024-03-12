import React, { FC, useEffect, useState, useRef } from "react";
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
} from "@mds/common/redux/actionCreators/permitActionCreator";
import { fetchPartyRelationships } from "@mds/common/redux/actionCreators/partiesActionCreator";
import {
  fetchMineRecordById,
  createMineTypes,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { getMines, getMineGuid } from "@mds/common/redux/selectors/mineSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import ExplosivesPermit from "@/components/mine/ExplosivesPermit/ExplosivesPermit";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/buttons/AddButton";
import MinePermitTable from "@/components/mine/Permit/MinePermitTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { getExplosivesPermits } from "@mds/common/redux/selectors/explosivesPermitSelectors";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { IPermit, IMine, IPermitPartyRelationship, IExplosivesPermit, Feature } from "@mds/common";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { DigitalPermitCredential } from "@/components/mine/DigitalPermitCredential/DigitalPermitCredential";
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

export const MinePermitInfo: FC<MinePermitInfoProps> = (props) => {
  const mine = props.mines[props.mineGuid];
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [modifiedPermits, setModifiedPermits] = useState(false);
  const [modifiedPermitGuid, setModifiedPermitGuid] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { isFeatureEnabled } = useFeatureFlag();

  const handleFetchData = () => {
    const { id } = props.match.params;
    return props.fetchMineRecordById(id).then(() => {
      props.fetchPermits(id);
      props.fetchPartyRelationships({
        mine_guid: id,
        relationships: "party",
        include_permit_contacts: "true",
      });
      setIsLoaded(true);
    });
  };

  const closePermitModal = () => {
    props.closeModal();
    handleFetchData();
  };

  // Permit Handlers
  const handleAddPermit = (values) => {
    const permit_no = values.is_exploration
      ? `${values.permit_type}X-${values.permit_no}`
      : `${values.permit_type}-${values.permit_no}`;
    const payload = { ...values, permit_no };
    setModifiedPermits(true);

    return props.createPermit(props.mineGuid, payload).then((data) => {
      const siteProperties = { ...values.site_properties, permit_guid: data.data.permit_guid };
      props.createMineTypes(props.mineGuid, [siteProperties]).then(closePermitModal);
    });
  };

  const handleEditPermit = (values) => {
    // we do not need to provide site_properties on status update as it will fail if the site_properties are empty
    delete values.site_properties;
    return props.updatePermit(props.mineGuid, values.permit_guid, values).then(closePermitModal);
  };

  const handleEditSiteProperties = (values) => {
    return props.updatePermit(props.mineGuid, values.permit_guid, values).then(closePermitModal);
  };

  const handleDeletePermit = (permitGuid) =>
    props.deletePermit(props.mineGuid, permitGuid).then(() => closePermitModal());

  // Amendment Handlers
  const handleEditPermitAmendment = (values) =>
    props
      .updatePermitAmendment(
        props.mineGuid,
        values.permit_guid,
        values.permit_amendment_guid,
        values
      )
      .then(closePermitModal);

  const handleAddPermitAmendment = (values) => {
    setModifiedPermits(true);
    setModifiedPermitGuid(values.permit_guid);
    return props
      .createPermitAmendment(props.mineGuid, values.permit_guid, values)
      .then(closePermitModal);
  };

  const handleAddAmalgamatedPermit = (values) => {
    setModifiedPermits(true);
    setModifiedPermitGuid(values.permit_guid);
    return props
      .createPermitAmendment(props.mineGuid, values.permit_guid, {
        ...values,
        permit_amendment_type_code: amalgamatedPermit,
      })
      .then(closePermitModal);
  };

  const handlePermitAmendmentIssueVC = (event, permit_amendment, permit) => {
    event.preventDefault();
    return props.createPermitAmendmentVC(
      props.mineGuid,
      permit.permitGuid,
      permit_amendment.permit_amendment_guid
    );
  };

  const handleRemovePermitAmendmentDocument = (permitGuid, permitAmendmentGuid, documentGuid) =>
    props
      .removePermitAmendmentDocument(props.mineGuid, permitGuid, permitAmendmentGuid, documentGuid)
      .then(() => {
        props.fetchPermits(props.mineGuid);
      });

  const handleDeletePermitAmendment = (record) =>
    props
      .deletePermitAmendment(
        props.mineGuid,
        record.permit.permit_guid,
        record.permit_amendment_guid
      )
      .then(() => closePermitModal());

  const onExpand = (expanded, record) =>
    setExpandedRowKeys((prevState) =>
      expanded ? prevState.concat(record.key) : prevState.filter((key) => key !== record.key)
    );

  const usePrevPermits = (permits) => {
    const ref = useRef<IPermit[]>();
    useEffect(() => {
      ref.current = permits;
    });
    return ref.current;
  };

  const prevPermits = usePrevPermits(props.permits);

  const openAddPermitModal = (event, onSubmit, title) => {
    event.preventDefault();
    props.openModal({
      props: {
        initialValues: {
          mine_guid: props.mineGuid,
        },
        onSubmit,
        title,
        mine_guid: props.mineGuid,
      },
      width: "50vw",
      content: modalConfig.ADD_PERMIT,
    });
  };

  const openViewConditionModal = (event, conditions, amendmentNumber, permitNo) => {
    event.preventDefault();
    return props.openModal({
      props: {
        title: `${permitNo} - Permit Conditions for Amendment #${amendmentNumber}`,
        closeModal: props.closeModal,
        conditions,
      },
      width: "50vw",
      isViewOnly: true,
      content: modalConfig.VIEW_ALL_CONDITION_MODAL,
    });
  };

  const openEditPermitModal = (event, permit) => {
    event.preventDefault();
    props.openModal({
      props: {
        initialValues: permit,
        onSubmit: handleEditPermit,
        title: `Edit Permit Status for ${permit.permit_no}`,
      },
      content: modalConfig.EDIT_PERMIT,
    });
  };

  const openEditSitePropertiesModal = (event, permit) => {
    event.preventDefault();
    props.openModal({
      props: {
        initialValues: permit,
        permit,
        onSubmit: handleEditSiteProperties,
        title: `Edit Site Properties for ${permit.permit_no}`,
      },
      content: modalConfig.EDIT_SITE_PROPERTIES_MODAL,
    });
  };

  // Amendment Modals
  const openAddAmendmentModal = (event, onSubmit, title, permit, type) => {
    event.preventDefault();
    props.openModal({
      props: {
        initialValues: {
          mine_guid: props.mineGuid,
          permit_guid: permit.permit_guid,
          permit_amendment_type_code: type,
          amendments: permit.permit_amendments,
          permit_prefix: permit.permit_prefix,
        },
        onSubmit,
        title,
        mine_guid: props.mineGuid,
        amendments: permit.permit_amendments,
      },
      width: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    });
  };

  const openAddHistoricalAmendmentModal = (event, onSubmit, title, permit, type) => {
    event.preventDefault();
    props.openModal({
      props: {
        initialValues: {
          mine_guid: props.mineGuid,
          permit_guid: permit.permit_guid,
          permit_amendment_type_code: type,
          amendments: permit.permit_amendments,
          is_historical_amendment: true,
          userRoles: props.userRoles,
          permit_prefix: permit.permit_prefix,
        },
        onSubmit,
        title,
        is_historical_amendment: true,
        mine_guid: props.mineGuid,
        amendments: permit.permit_amendments,
      },
      width: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    });
  };

  const openEditAmendmentModal = (event, permit_amendment, permit) => {
    event.preventDefault();
    const originalPermitAmendment = permit.permit_amendments.filter(
      (x) => x.permit_amendment_type_code === originalPermit
    )[0];
    props.openModal({
      props: {
        initialValues: {
          ...permit_amendment,
          amendments: permit.permit_amendments,
          userRoles: props.userRoles,
          is_historical_amendment:
            originalPermitAmendment &&
            originalPermitAmendment.issue_date > permit_amendment.issue_date,
          permit_prefix: permit.permit_prefix,
        },
        onSubmit: handleEditPermitAmendment,
        title:
          permit_amendment.permit_amendment_type_code === originalPermit
            ? `Edit Initial Permit for ${permit.permit_no}`
            : `Edit Permit Amendment for ${permit.permit_no}`,
        mine_guid: props.mineGuid,
        isMajorMine: props.mines[props.mineGuid].major_mine_ind,
        permit_guid: permit.permit_guid,
        handleRemovePermitAmendmentDocument: handleRemovePermitAmendmentDocument,
      },
      width: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    });
  };

  const openAddAmalgamatedPermitModal = (event, permit) =>
    openAddAmendmentModal(
      event,
      handleAddAmalgamatedPermit,
      `Add Amalgamated Permit to ${permit.permit_no}`,
      permit,
      amalgamatedPermit
    );

  const openAddPermitAmendmentModal = (event, permit) =>
    openAddAmendmentModal(
      event,
      handleAddPermitAmendment,
      `Add Permit Amendment to ${permit.permit_no}`,
      permit,
      null
    );

  const openAddPermitHistoricalAmendmentModal = (event, permit) =>
    openAddHistoricalAmendmentModal(
      event,
      handleAddPermitAmendment,
      `Add Permit Historical Amendment to ${permit.permit_no}`,
      permit,
      null
    );

  useEffect(() => {
    if (props.permits.length === 0 || !props.mineGuid) {
      handleFetchData();
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (modifiedPermits && props.permits !== prevPermits) {
      const currentPermits =
        prevPermits &&
        prevPermits.filter((p) => p.mine_guid === props.mineGuid).map((x) => x.permit_guid);
      const nextPermits =
        props.permits &&
        props.permits.filter((p) => p.mine_guid === props.mineGuid).map((x) => x.permit_guid);

      setExpandedRowKeys(
        modifiedPermitGuid
          ? [modifiedPermitGuid]
          : nextPermits.filter((key) => currentPermits.indexOf(key) === -1)
      );
      setModifiedPermitGuid(null);
    }
  }, [props.permits]);

  return (
    <div className="tab__content">
      <div>
        <h2>Permits</h2>
        <Divider />
      </div>
      {/* @ts-ignore */}
      <Tabs type="card" style={{ textAlign: "left !important" }}>
        <Tabs.TabPane tab={`Mines Act Permits (${props.permits?.length | 0})`} key="1">
          <>
            <br />
            <div>
              <div className="inline-flex between">
                <h4 className="uppercase">Mines Act Permits</h4>
                <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                  <AddButton
                    onClick={(event) =>
                      openAddPermitModal(
                        event,
                        handleAddPermit,
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
              isLoaded={isLoaded}
              permits={props.permits}
              partyRelationships={props.partyRelationships}
              major_mine_ind={mine.major_mine_ind}
              openEditPermitModal={openEditPermitModal}
              openEditAmendmentModal={openEditAmendmentModal}
              openEditSitePropertiesModal={openEditSitePropertiesModal}
              openAddPermitAmendmentModal={openAddPermitAmendmentModal}
              openAddPermitHistoricalAmendmentModal={openAddPermitHistoricalAmendmentModal}
              openAddAmalgamatedPermitModal={openAddAmalgamatedPermitModal}
              handlePermitAmendmentIssueVC={handlePermitAmendmentIssueVC}
              expandedRowKeys={expandedRowKeys}
              onExpand={onExpand}
              handleDeletePermit={handleDeletePermit}
              handleDeletePermitAmendment={handleDeletePermitAmendment}
              openViewConditionModal={openViewConditionModal}
            />
          </>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={`Explosives Storage & Use Permits (${
            props.explosivesPermits.filter(({ application_status }) => application_status === "APP")
              .length
          })`}
          key="2"
        >
          <>
            <ExplosivesPermit isPermitTab />
          </>
        </Tabs.TabPane>
        {isFeatureEnabled(Feature.VERIFIABLE_CREDENTIALS) && (
          <Tabs.TabPane
            tab={`Digital Permit Credentials (${
              props.permits.filter(
                ({ current_permittee_digital_wallet_connection_state }) =>
                  !!current_permittee_digital_wallet_connection_state
              ).length
            })`}
            key="3"
          >
            <>
              <DigitalPermitCredential />
            </>
          </Tabs.TabPane>
        )}
      </Tabs>
    </div>
  );
};

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

export default connect(mapStateToProps, mapDispatchToProps)(MinePermitInfo);

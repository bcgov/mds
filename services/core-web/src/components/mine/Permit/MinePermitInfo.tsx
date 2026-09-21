import React, { FC, useEffect, useState, useRef } from "react";
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
import { fetchPartyRelationships } from "@mds/common/redux/slices/partiesSlice";
import {
  fetchMineRecordById,
  createMineTypes,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { getMineGuid, getMineById } from "@mds/common/redux/selectors/mineSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import ExplosivesPermit from "@/components/mine/ExplosivesPermit/ExplosivesPermit";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/buttons/AddButton";
import MinePermitTable from "@/components/mine/Permit/MinePermitTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { getExplosivesPermits } from "@mds/common/redux/selectors/explosivesPermitSelectors";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { IPermit } from "@mds/common/interfaces";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { DigitalPermitCredential } from "@/components/mine/DigitalPermitCredential/DigitalPermitCredential";
import { Feature } from "@mds/common/utils/featureFlag";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { useParams } from "react-router-dom";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const amalgamatedPermit = "ALG";
const originalPermit = "OGP";


export const MinePermitInfo: FC = () => {
  const mineGuid = useAppSelector(getMineGuid);
  const mine = useAppSelector(getMineById(mineGuid));
  const permits = useAppSelector(getPermits);
  const explosivesPermits = useAppSelector(getExplosivesPermits);
  const userRoles = useAppSelector(getUserAccessData);
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [modifiedPermits, setModifiedPermits] = useState(false);
  const [modifiedPermitGuid, setModifiedPermitGuid] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { isFeatureEnabled } = useFeatureFlag();

  const handleFetchData = () => {
    return dispatch(fetchMineRecordById(id)).then(() => {
      dispatch(fetchPermits(id));
      dispatch(fetchPartyRelationships({
        mine_guid: id,
        relationships: "party",
        include_permit_contacts: "true",
      }));
      setIsLoaded(true);
    });
  };

  const closePermitModal = () => {
    dispatch(closeModal());
    handleFetchData();
  };

  // Permit Handlers
  const handleAddPermit = (values) => {
    const permit_no = values.is_exploration
      ? `${values.permit_type}X-${values.permit_no}`
      : `${values.permit_type}-${values.permit_no}`;
    const payload = { ...values, permit_no };
    setModifiedPermits(true);

    return dispatch(createPermit(mineGuid, payload)).then((data) => {
      if (data) {
        const siteProperties = { ...values.site_properties, permit_guid: data.data.permit_guid };
        dispatch(createMineTypes(mineGuid, [siteProperties])).then(closePermitModal);
      }
    });
  };

  const handleEditPermit = (values) => {
    // we do not need to provide site_properties on status update as it will fail if the site_properties are empty
    delete values.site_properties;
    return dispatch(updatePermit(mineGuid, values.permit_guid, values)).then(closePermitModal);
  };

  const handleEditSiteProperties = (values) => {
    return dispatch(updatePermit(mineGuid, values.permit_guid, values)).then(closePermitModal);
  };

  const handleDeletePermit = (permitGuid) =>
    dispatch(deletePermit(mineGuid, permitGuid)).then(() => closePermitModal());

  // Amendment Handlers
  const handleEditPermitAmendment = (values) =>
    dispatch(updatePermitAmendment(
      mineGuid,
      values.permit_guid,
      values.permit_amendment_guid,
      values
    ))
      .then(closePermitModal);

  const handleAddPermitAmendment = (values) => {
    setModifiedPermits(true);
    setModifiedPermitGuid(values.permit_guid);
    return dispatch(createPermitAmendment(mineGuid, values.permit_guid, values))
      .then(closePermitModal);
  };

  const handleAddAmalgamatedPermit = (values) => {
    setModifiedPermits(true);
    setModifiedPermitGuid(values.permit_guid);
    return dispatch(createPermitAmendment(mineGuid, values.permit_guid, {
      ...values,
      permit_amendment_type_code: amalgamatedPermit,
    }))
      .then(closePermitModal);
  };

  const handlePermitAmendmentIssueVC = (event, permit_amendment, permit) => {
    event.preventDefault();
    return dispatch(createPermitAmendmentVC(
      mineGuid,
      permit.permitGuid,
      permit_amendment.permit_amendment_guid
    ));
  };

  const handleRemovePermitAmendmentDocument = (permitGuid, permitAmendmentGuid, documentGuid) =>
    dispatch(
      removePermitAmendmentDocument(mineGuid, permitGuid, permitAmendmentGuid, documentGuid))
      .then(() => {
        dispatch(fetchPermits(mineGuid));
      });

  const handleDeletePermitAmendment = (record) =>
    dispatch(deletePermitAmendment(
      mineGuid,
      record.permit.permit_guid,
      record.permit_amendment_guid
    ))
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

  const prevPermits = usePrevPermits(permits);

  const openAddPermitModal = (event, onSubmit, title) => {
    event.preventDefault();
    dispatch(openModal({
      props: {
        initialValues: {
          mine_guid: mineGuid,
        },
        onSubmit,
        title,
        mine_guid: mineGuid,
      },
      width: "50vw",
      content: modalConfig.ADD_PERMIT,
    }));
  };

  const openViewConditionModal = (event, conditions, amendmentNumber, permitNo) => {
    event.preventDefault();
    return dispatch(openModal({
      props: {
        title: `${permitNo} - Permit Conditions for Amendment #${amendmentNumber}`,
        closeModal: () => dispatch(closeModal()),
        conditions,
      },
      width: "50vw",
      isViewOnly: true,
      content: modalConfig.VIEW_ALL_CONDITION_MODAL,
    }));
  };

  const openEditPermitModal = (event, permit) => {
    event.preventDefault();
    dispatch(openModal({
      props: {
        initialValues: permit,
        onSubmit: handleEditPermit,
        title: `Edit Permit Status for ${permit.permit_no}`,
      },
      content: modalConfig.EDIT_PERMIT,
    }));
  };

  const openEditSitePropertiesModal = (event, permit) => {
    event.preventDefault();
    dispatch(openModal({
      props: {
        initialValues: permit,
        permit,
        onSubmit: handleEditSiteProperties,
        title: `Edit Site Properties for ${permit.permit_no}`,
      },
      content: modalConfig.EDIT_SITE_PROPERTIES_MODAL,
    }));
  };

  // Amendment Modals
  const openAddAmendmentModal = (event, onSubmit, title, permit, type) => {
    event.preventDefault();
    const show_vc_warning =
      permit.current_permittee_digital_wallet_connection_state &&
      permit.permit_amendments.some(
        (amendment) => amendment.vc_credential_exch_state === "credential_acked"
      );
    dispatch(openModal({
      props: {
        initialValues: {
          mine_guid: mineGuid,
          permit_guid: permit.permit_guid,
          permit_amendment_type_code: type,
          amendments: permit.permit_amendments,
          permit_prefix: permit.permit_prefix,
        },
        onSubmit,
        title,
        mine_guid: mineGuid,
        amendments: permit.permit_amendments,
        show_vc_warning: show_vc_warning,
      },
      width: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    }));
  };

  const openAddHistoricalAmendmentModal = (event, onSubmit, title, permit, type) => {
    event.preventDefault();
    dispatch(openModal({
      props: {
        initialValues: {
          mine_guid: mineGuid,
          permit_guid: permit.permit_guid,
          permit_amendment_type_code: type,
          amendments: permit.permit_amendments,
          is_historical_amendment: true,
          userRoles: userRoles,
          permit_prefix: permit.permit_prefix,
        },
        onSubmit,
        title,
        is_historical_amendment: true,
        mine_guid: mineGuid,
        amendments: permit.permit_amendments,
      },
      width: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    }));
  };

  const openEditAmendmentModal = (event, permit_amendment, permit) => {
    event.preventDefault();
    const originalPermitAmendment = permit.permit_amendments.filter(
      (x) => x.permit_amendment_type_code === originalPermit
    )[0];
    dispatch(openModal({
      props: {
        initialValues: {
          ...permit_amendment,
          amendments: permit.permit_amendments,
          userRoles: userRoles,
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
        mine_guid: mineGuid,
        isMajorMine: mine.major_mine_ind,
        permit_guid: permit.permit_guid,
        handleRemovePermitAmendmentDocument: handleRemovePermitAmendmentDocument,
      },
      width: "50vw",
      content: modalConfig.PERMIT_AMENDMENT,
    }));
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
    if (permits.length === 0 || !mineGuid) {
      handleFetchData();
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (modifiedPermits && permits !== prevPermits) {
      const currentPermits = prevPermits
        ?.filter((p) => p.mine_guid === mineGuid)
        .map((x) => x.permit_guid);
      const nextPermits = permits
        ?.filter((p) => p.mine_guid === mineGuid)
        .map((x) => x.permit_guid);

      setExpandedRowKeys(
        modifiedPermitGuid
          ? [modifiedPermitGuid]
          : nextPermits.filter((key) => currentPermits.indexOf(key) === -1)
      );
      setModifiedPermitGuid(null);
    }
  }, [permits]);

  const tabItems = [
    {
      key: "permits",
      label: `Mines Act Permits (${permits?.length | 0})`,
      children: <>
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
          permits={permits}
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
    },
    {
      key: "esups",
      label: `Explosives Storage & Use Permits (${explosivesPermits.filter(({ application_status }) => application_status === "APP")
        .length
        })`,
      children: <ExplosivesPermit isPermitTab />
    },
    isFeatureEnabled(Feature.VC_ANONCREDS_CORE) && {
      key: "digital-permit-credentials",
      label: `Digital Permit Credentials (${permits.filter(
        ({ current_permittee_digital_wallet_connection_state }) =>
          !!current_permittee_digital_wallet_connection_state
      ).length
        })`,
      children: <DigitalPermitCredential />
    }
  ].filter(Boolean);

  return (
    <div className="tab__content">
      <div>
        <h2>Permits</h2>
        <Divider />
      </div>
      <Tabs type="card" items={tabItems} />
    </div>
  );
};

export default MinePermitInfo;

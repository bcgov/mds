import React, { FC } from "react";
import { connect } from "react-redux";

import { openModal } from "@mds/common/redux/actions/modalActions";
import { getDropdownPermitStatusOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { permitFileColumns } from "@/components/dashboard/mine/permits/permitFileColumns";
import CoreTable from "@mds/common/components/common/CoreTable";
import { Badge } from "antd";
import {
  renderActionsColumn,
  renderCategoryColumn,
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import IssuePermitDigitalCredential from "@/components/modalContent/verifiableCredentials/IssuePermitDigitalCredential";
import { IPermit } from "@mds/common/interfaces/permits/permit.interface";
import { VC_CONNECTION_STATES, VC_CRED_ISSUE_STATES } from "@mds/common/constants/enums";
import { Feature, isFeatureEnabled } from "@mds/common/utils/featureFlag";
import { IPermitAmendment } from "@mds/common/interfaces";

const draftAmendment = "DFT";

const permitTypes = {
  Permit: "Mines Act Permit",
};

interface PermitsTableProps {
  isLoaded: boolean;
  permits: IPermit[];
  majorMineInd: boolean;
  openModal: (value: any) => void;
  openVCWalletInvitationModal: (
    event,
    partyGuid: string,
    partyName: string,
    connectionState: string
  ) => void;
}

export const PermitsTable: FC<PermitsTableProps> = (props) => {
  const columns = [
    renderTextColumn("permit_no", "Permit No.", true),
    renderTextColumn("current_permittee", "Permittee"),
    renderTextColumn("permit_type", "Permit Type", true),
    renderCategoryColumn("permit_status_code", "Permit Status", { C: "Closed", O: "Open" }, true),
    renderDateColumn("firstIssued", "First Issued", true),
  ];

  const showVCColumn =
    isFeatureEnabled(Feature.VC_ANONCREDS_MINESPACE) &&
    props.majorMineInd &&
    props.permits.some((p) => {
      // look for *any* active wallet connections to show the issuance column/action
      const walletStatus = p.current_permittee_digital_wallet_connection_state;
      return VC_CONNECTION_STATES[walletStatus] === VC_CONNECTION_STATES.active;
    });

  const colourMap = {
    [VC_CRED_ISSUE_STATES.null]: "#F1C21B",
    [VC_CRED_ISSUE_STATES.offer_sent]: "#F1C21B",
    [VC_CRED_ISSUE_STATES.credential_acked]: "#45A776",
    [VC_CRED_ISSUE_STATES.abandoned]: "#D8292F",
    [VC_CRED_ISSUE_STATES.credential_revoked]: "#D8292F",
  };
  const issuanceStateColumn = {
    title: "Issuance State",
    key: "lastAmendedVC",
    dataIndex: "lastAmendedVC",
    render: (text, record) => {
      if (text == "credential_revoked" && !record.mines_act_permit_vc_locked) {
        // if revoked by not locked, treat as 'available'.
        text = null;
      }
      const badgeText = text ? VC_CRED_ISSUE_STATES[text] : "Available";
      const colour = colourMap[badgeText] ?? "#F1C21B";
      return <Badge color={colour} text={badgeText} />;
    },
  };

  const openIssuanceModal = (event, permit) => {
    event.preventDefault();
    props.openModal({
      props: {
        title: "Issue Digital Credential",
        issuanceState: permit.lastAmendedVC,
        connectionState: permit.current_permittee_digital_wallet_connection_state,
        permitAmendmentGuid: permit.lastAmendedGuid,
        permit: permit,
        openVCWalletInvitationModal: props.openVCWalletInvitationModal,
      },
      content: IssuePermitDigitalCredential,
    });
  };

  const actions = [
    {
      key: "vc_issue",
      label: "Issue as digital credential",
      clickFunction: openIssuanceModal,
    },
  ];

  const filterActions = (record, actionList) => {
    let filteredActionList = actionList;

    // filter for permit type and vc_issue key
    if (record.permit_type !== permitTypes.Permit || !showVCColumn) {
      filteredActionList = filteredActionList.filter((a) => a.key !== "vc_issue");
    }

    return filteredActionList;
  };

  const actionColumn = renderActionsColumn({ actions, recordActionsFilter: filterActions });
  columns.splice(3, 0, issuanceStateColumn);
  columns.push(actionColumn);

  const transformExpandedPermitRowData = (amendment: IPermitAmendment, amendmentNumber) => ({
    ...amendment,
    amendmentNumber,
    maps: amendment.now_application_documents?.filter(
      (doc) => doc.now_application_document_sub_type_code === "MDO"
    ),
  });

  const transformRowData = (permit) => {
    const filteredAmendments = permit.permit_amendments.filter(
      (a) => a.permit_amendment_status_code !== draftAmendment
    );
    const latestAmendment = filteredAmendments[0];
    const firstAmendment = filteredAmendments[filteredAmendments.length - 1];

    return {
      ...permit,
      key: permit.permit_guid,
      permit_type: permitTypes.Permit,
      majorMineInd: props.majorMineInd,
      authorization_end_date: latestAmendment?.authorization_end_date,
      firstIssued: firstAmendment?.issue_date,
      lastAmended: latestAmendment?.issue_date,
      lastAmendedVC: latestAmendment?.vc_credential_exch_state,
      lastAmendedGuid: latestAmendment?.permit_amendment_guid,
      permit_amendments: filteredAmendments.map((amendment, index) =>
        transformExpandedPermitRowData(amendment, permit.permit_amendments.length - index)
      ),
    };
  };

  const permitRowData = props.permits.map((permit) => transformRowData(permit));

  const expandedColumns = [
    renderTextColumn("amendmentNumber", "Amendment No."),
    renderDateColumn("issue_date", "Date Issued"),
    renderDateColumn("authorization_end_date", "Authorization End Date"),
    renderTextColumn("description", "Description"),
    ...permitFileColumns,
  ];

  return (
    <CoreTable
      loading={!props.isLoaded}
      columns={columns}
      dataSource={permitRowData}
      emptyText="This mine has no permit data."
      expandProps={{
        getDataSource: (record) => record.permit_amendments,
        subTableColumns: expandedColumns,
        rowKey: "amendmentNumber",
        recordDescription: "amendment history",
      }}
    />
  );
};

const mapStateToProps = (state) => ({
  permitStatusOptions: getDropdownPermitStatusOptions(state),
});

const mapDispatchToProps = {
  openModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(PermitsTable);

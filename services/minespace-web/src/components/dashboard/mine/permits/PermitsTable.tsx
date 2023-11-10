import React, { FC } from "react";
import { connect } from "react-redux";
import {
  Feature,
  IPermit,
  VC_CONNECTION_STATES,
  VC_CRED_ISSUE_STATES,
  isFeatureEnabled,
} from "@mds/common/index";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { truncateFilename } from "@common/utils/helpers";
import { getDropdownPermitStatusOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";
import * as Strings from "@/constants/strings";
import CoreTable from "@/components/common/CoreTable";
import { Badge } from "antd";
import {
  renderActionsColumn,
  renderCategoryColumn,
  renderDateColumn,
  renderTextColumn,
} from "@/components/common/CoreTableCommonColumns";
import IssuePermitDigitalCredential from "@/components/modalContent/verifiableCredentials/IssuePermitDigitalCredential";

const draftAmendment = "DFT";

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
    renderCategoryColumn("permit_status_code", "Permit Status", { C: "Closed", O: "Open" }, true),
    renderDateColumn("authorizationEndDate", "Authorization End Date", true),
    renderDateColumn("firstIssued", "First Issued", true),
    renderDateColumn("lastAmended", "Last Amended", true),
  ];

  if (
    isFeatureEnabled(Feature.VERIFIABLE_CREDENTIALS) &&
    props.majorMineInd &&
    props.permits.some((p) => {
      // look for *any* active wallet connections to show the issuance column/action
      const walletStatus = p.current_permittee_digital_wallet_connection_state;
      return VC_CONNECTION_STATES[walletStatus] === VC_CONNECTION_STATES.active;
    })
  ) {
    const colourMap = {
      "Not Active": "#D8292F",
      Pending: "#F1C21B",
      Active: "#45A776",
    };
    const issuanceStateColumn = {
      title: "Issuance State",
      key: "lastAmendedVC",
      dataIndex: "lastAmendedVC",
      render: (text) => {
        const badgeText = text ? VC_CRED_ISSUE_STATES[text] : "N/A";
        const colour = colourMap[badgeText] ?? "transparent";
        return <Badge color={colour} text={badgeText} />;
      },
    };

    const openIssuanceModal = (event, permit) => {
      event.preventDefault();
      props.openModal({
        props: {
          title: "Issue Permit as Digital Credential",
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
    const actionColumn = renderActionsColumn(actions);
    columns.splice(3, 0, issuanceStateColumn);
    columns.push(actionColumn);
  }

  const finalApplicationPackage = (amendment) => {
    const finalAppPackageCore =
      amendment?.now_application_documents?.length > 0
        ? amendment.now_application_documents.filter((doc) => doc.is_final_package)
        : [];
    const finalAppPackageImported =
      amendment?.imported_now_application_documents?.length > 0
        ? amendment.imported_now_application_documents.filter((doc) => doc.is_final_package)
        : [];
    return finalAppPackageCore.concat(finalAppPackageImported);
  };

  const transformRowData = (permit, majorMineInd) => {
    const filteredAmendments = permit.permit_amendments.filter(
      (a) => a.permit_amendment_status_code !== draftAmendment
    );
    const latestAmendment = filteredAmendments[0];
    const firstAmendment = filteredAmendments[filteredAmendments.length - 1];

    return {
      ...permit,
      majorMineInd: majorMineInd,
      authorizationEndDate: latestAmendment?.authorization_end_date,
      firstIssued: firstAmendment?.issue_date,
      lastAmended: latestAmendment?.issue_date,
      lastAmendedVC: latestAmendment?.vc_credential_exch_state,
      lastAmendedGuid: latestAmendment?.permit_amendment_guid,
      permit_amendments: filteredAmendments,
    };
  };

  const transformExpandedRowData = (amendment, amendmentNumber) => ({
    ...amendment,
    amendmentNumber,
    maps: amendment.now_application_documents?.filter(
      (doc) => doc.now_application_document_sub_type_code === "MDO"
    ),
    permitPackage: finalApplicationPackage(amendment),
  });

  const rowData = props.permits.map((permit) => transformRowData(permit, props.majorMineInd));

  const getExpandedRowData = (permit) =>
    permit.permit_amendments
      ? permit.permit_amendments.map((amendment, index) =>
          transformExpandedRowData(amendment, permit.permit_amendments.length - index)
        )
      : [];

  const expandedColumns = [
    renderTextColumn("amendmentNumber", "Amendment No."),
    renderDateColumn("issue_date", "Date Issued"),
    renderDateColumn("authorization_end_date", "Authorization End Date"),
    renderTextColumn("description", "Description"),
    {
      title: "Permit Package",
      dataIndex: "permitPackage",
      key: "permitPackage",
      render: (text) => (
        <div title="Permit Package">
          {(text &&
            text.length > 0 &&
            text.map((file) => (
              <LinkButton
                key={file.mine_document.document_manager_guid}
                onClick={() => downloadFileFromDocumentManager(file.mine_document)}
                // @ts-ignore (compiler is wrong, title is a global attribute available on <a>)
                title={file.mine_document.document_name}
              >
                <p className="wrapped-text">{truncateFilename(file.mine_document.document_name)}</p>
              </LinkButton>
            ))) ||
            Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Permit Files",
      dataIndex: "related_documents",
      key: "documents",
      render: (text) => (
        <div title="Permit Files">
          {(text &&
            text.length > 0 &&
            text.map((file) => (
              <LinkButton
                key={file.document_manager_guid}
                onClick={() => downloadFileFromDocumentManager(file)}
                // @ts-ignore
                title={file.document_name}
              >
                <p className="wrapped-text">{truncateFilename(file.document_name)}</p>
              </LinkButton>
            ))) ||
            Strings.EMPTY_FIELD}
        </div>
      ),
    },
  ];

  return (
    <CoreTable
      loading={!props.isLoaded}
      columns={columns}
      dataSource={rowData}
      rowKey="permit_no"
      emptyText="This mine has no permit data."
      expandProps={{
        getDataSource: getExpandedRowData,
        subTableColumns: expandedColumns,
        rowKey: "permit_amendment_guid",
      }}
    />
  );
};

const mapStateToProps = (state) => ({
  permitStatusOptions: getDropdownPermitStatusOptions(state),
});

const mapDispatchToProps = {
  openModal,
  closeModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(PermitsTable);

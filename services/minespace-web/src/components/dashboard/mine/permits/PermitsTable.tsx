import React, { FC } from "react";
import { connect } from "react-redux";
import {
  Feature,
  IExplosivesPermit,
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
  explosivesPermits: IExplosivesPermit[];
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
    renderDateColumn("authorization_end_date", "Authorization End Date", true),
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

  const transformExpandedPermitRowData = (amendment, amendmentNumber) => ({
    ...amendment,
    amendmentNumber,
    maps: amendment.now_application_documents?.filter(
      (doc) => doc.now_application_document_sub_type_code === "MDO"
    ),
    permitPackage: finalApplicationPackage(amendment),
  });

  const transformRowData = (permit) => {
    const filteredAmendments = permit.permit_amendments.filter(
      (a) => a.permit_amendment_status_code !== draftAmendment
    );
    const latestAmendment = filteredAmendments[0];
    const firstAmendment = filteredAmendments[filteredAmendments.length - 1];

    return {
      ...permit,
      permit_type: "Mines Act Permit",
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

  const transformEsupData = (esup) => {
    const transformEsupAmendment = (amendment, index = 0) => {
      return {
        permit_no: amendment.permit_number,
        amendmentNumber: index + 1, //amendment.explosives_permit_amendment_id ?? 'first', //index + 1,
        permit_amendment_guid:
          amendment.explosives_permit_amendment_guid ?? esup.explosives_permit_guid,
        current_permittee: amendment.permittee_name,
        permit_status_code: amendment.is_closed ? "C" : "O",
        issue_date: amendment.issue_date,
        description: amendment.description,
        authorization_end_date: amendment.expiry_date,
        related_documents: amendment.documents,
        permit_type: "Explosive Storage and Use",
      };
    };

    let lastAmended = esup.issue_date;
    if (esup?.explosives_permit_amendments.length > 0) {
      const lastAmendment =
        esup.explosives_permit_amendments[esup.explosives_permit_amendments.length - 1];
      lastAmended = lastAmendment.issue_date;
    }
    // esup amendments don't initially include 1st record as amendment
    const firstAmendment = transformEsupAmendment(esup);
    const permit_amendments = esup.explosives_permit_amendments
      .map((a, i) => transformEsupAmendment(a, i + 1))
      .toReversed();
    permit_amendments.push(firstAmendment);

    return {
      ...firstAmendment,
      firstIssued: esup.issue_date,
      lastAmended: lastAmended,
      permit_amendments: permit_amendments,
    };
  };

  const esupRowData = props.explosivesPermits.map((esup) => transformEsupData(esup));
  const permitRowData = props.permits.map((permit) => transformRowData(permit));
  const rowData = [...esupRowData, ...permitRowData];

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
        getDataSource: (record) => record.permit_amendments,
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

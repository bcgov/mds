import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { openModal, closeModal } from "@common/actions/modalActions";
import { truncateFilename, dateSorter } from "@common/utils/helpers";
import { getDropdownPermitStatusOptions } from "@common/selectors/staticContentSelectors";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { formatDate } from "@/utils/helpers";
import LinkButton from "@/components/common/LinkButton";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";
import CoreTable from "@/components/common/CoreTable";
import { Button } from "antd";

const draftAmendment = "DFT";

const propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  majorMineInd: PropTypes.bool.isRequired,
};

const columns = [
  {
    title: "Permit No.",
    dataIndex: "number",
    key: "number",
    sorter: (a, b) => (a.number > b.number ? -1 : 1),
  },
  {
    title: "Permitee",
    dataIndex: "permitee",
    key: "permitee",
  },
  {
    title: "",
    dataIndex: "permitee_guid",
    render: (text, record) => (
      <div title="">
        {record.majorMineInd && (
          <Button
            style={{ display: "inline" }}
            type="secondary"
            onClick={(event) => record.openVCWalletInvitationModal(event, text, record.permitee)}
          >
            Wallet Connection Info
          </Button>
        )}
      </div>
    ),
  },
  {
    title: "Permit Status",
    dataIndex: "status",
    key: "status",
    sorter: (a, b) => (a.status > b.status ? -1 : 1),
  },
  {
    title: "Authorization End Date",
    dataIndex: "authorizationEndDate",
    key: "authorizationEndDate",
    sorter: dateSorter("authorizationEndDate"),
  },
  {
    title: "First Issued",
    dataIndex: "firstIssued",
    key: "firstIssued",
    sorter: dateSorter("firstIssued"),
  },
  {
    title: "Last Amended",
    dataIndex: "lastAmended",
    key: "lastAmended",
    sorter: dateSorter("lastAmended"),
    defaultSortOrder: "ascend",
  },
];

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

const transformRowData = (
  permit,
  permitStatusOptions,
  openVCWalletInvitationModal,
  majorMineInd
) => {
  const filteredAmendments = permit.permit_amendments.filter(
    (a) => a.permit_amendment_status_code !== draftAmendment
  );
  const latestAmendment = filteredAmendments[0];
  const firstAmendment = filteredAmendments[filteredAmendments.length - 1];
  return {
    key: permit.permit_no || Strings.EMPTY_FIELD,
    number: permit.permit_no || Strings.EMPTY_FIELD,
    permitee: permit.current_permittee || Strings.EMPTY_FIELD,
    permitee_guid: permit.current_permittee_guid || Strings.EMPTY_FIELD,
    majorMineInd: majorMineInd,
    openVCWalletInvitationModal: openVCWalletInvitationModal,
    status:
      (permit.permit_status_code &&
        permitStatusOptions.find((item) => item.value === permit.permit_status_code).label) ||
      Strings.EMPTY_FIELD,
    authorizationEndDate:
      (latestAmendment && formatDate(latestAmendment.authorization_end_date)) ||
      Strings.EMPTY_FIELD,
    firstIssued: (firstAmendment && formatDate(firstAmendment.issue_date)) || Strings.EMPTY_FIELD,
    lastAmended: (latestAmendment && formatDate(latestAmendment.issue_date)) || Strings.EMPTY_FIELD,
    permit_amendments: filteredAmendments,
  };
};

const transformExpandedRowData = (amendment, amendmentNumber) => ({
  key: amendmentNumber,
  amendmentNumber,
  dateIssued: formatDate(amendment.issue_date) || Strings.EMPTY_FIELD,
  authorizationEndDate: formatDate(amendment.authorization_end_date) || Strings.EMPTY_FIELD,
  description: amendment.description || Strings.EMPTY_FIELD,
  documents: amendment.related_documents,
  maps: amendment.now_application_documents?.filter(
    (doc) => doc.now_application_document_sub_type_code === "MDO"
  ),
  permitPackage: finalApplicationPackage(amendment),
});

export const PermitsTable = (props) => {
  const openVCWalletInvitationModal = (event, partyGuid, partyName) => {
    event.preventDefault();
    props.openModal({
      props: {
        title: "Digital Wallet Connection Invitation",
        partyGuid: partyGuid,
        partyName: partyName,
        connectionState: "active",
      },
      content: modalConfig.VC_WALLET_INVITATION,
    });
  };

  const rowData = props.permits.map((permit) =>
    transformRowData(
      permit,
      props.permitStatusOptions,
      openVCWalletInvitationModal,
      props.majorMineInd
    )
  );

  const getExpandedRowData = (permit) =>
    permit.permit_amendments
      ? permit.permit_amendments.map((amendment, index) =>
          transformExpandedRowData(amendment, permit.permit_amendments.length - index)
        )
      : [];

  const expandedColumns = [
    {
      title: "Amendment No.",
      dataIndex: "amendmentNumber",
      key: "amendmentNumber",
      width: "30px",
    },
    { title: "Date Issued", dataIndex: "dateIssued", key: "dateIssued" },
    {
      title: "Authorization End Date",
      dataIndex: "authorizationEndDate",
      key: "authorizationEndDate",
      width: "200px",
      render: (text) => <div title="Authorization End Date">{text}</div>,
    },
    { title: "Description", dataIndex: "description", key: "description" },
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
      dataIndex: "documents",
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
    {
      title: "",
      dataIndex: "",
      render: (text, record) => (
        <div title="">
          <Button style={{ display: "inline" }} type="primary">
            Issue Digital Credential
          </Button>
        </div>
      ),
    },
  ];

  return (
    <CoreTable
      loading={!props.isLoaded}
      columns={columns}
      dataSource={rowData}
      emptyText="This mine has no permit data."
      expandProps={{
        getDataSource: getExpandedRowData,
        subTableColumns: expandedColumns,
      }}
    />
  );
};

PermitsTable.propTypes = propTypes;

const mapStateToProps = (state) => ({
  permitStatusOptions: getDropdownPermitStatusOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PermitsTable);

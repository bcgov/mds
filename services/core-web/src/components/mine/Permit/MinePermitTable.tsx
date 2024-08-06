import React from "react";
import { Modal, notification } from "antd";
import { useHistory, useParams } from "react-router-dom";
import {
  PlusOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { Feature, USER_ROLES } from "@mds/common/index";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { formatDate } from "@common/utils/helpers";
import {
  getDropdownPermitStatusOptionsHash,
  getPermitAmendmentTypeOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import * as Strings from "@mds/common/constants/strings";
import { PERMIT_AMENDMENT_TYPES } from "@mds/common/constants/strings";
import { isEmpty } from "lodash";
import CoreTable from "@mds/common/components/common/CoreTable";
import DocumentLink from "@/components/common/DocumentLink";
import * as route from "@/constants/routes";
import { VIEW_MINE_PERMIT } from "@/constants/routes";
import { IMineDocument, IPermit, IPermitAmendment } from "@mds/common";
import { ColumnsType } from "antd/lib/table";
import {
  ITableAction,
  renderActionsColumn,
  renderCategoryColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { getDocumentDownloadToken } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { downloadDocument, waitFor } from "@/components/common/downloads/helpers";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";

/**
 * @class  MinePermitTable - displays a table of permits and permit amendments
 */

const draftAmendment = "DFT";

interface MinePermitTableProps {
  permits?: IPermit[];
  openEditPermitModal: (arg1: any, arg2: IPermit) => any;
  openAddPermitAmendmentModal: (arg1: any, arg2: IPermit) => any;
  openAddAmalgamatedPermitModal: (arg1: any, arg2: IPermit) => any;
  openAddPermitHistoricalAmendmentModal: (arg1: any, arg2: IPermit) => any;
  openEditAmendmentModal: (arg1: any, arg2: IPermitAmendment, arg3: IPermit) => any;
  expandedRowKeys: string[];
  onExpand: (arg1: any, arg2: any) => any;
  isLoaded: boolean;
  handleDeletePermit: (arg1: string) => any;
  handleDeletePermitAmendment: (arg1: any) => any;
  handlePermitAmendmentIssueVC: (arg1: any, arg2: IPermitAmendment, arg3: IPermit) => any;
  openEditSitePropertiesModal: (arg1: any, arg2: IPermit) => any;
  openViewConditionModal: (arg1: any, arg2: any, arg3: any, arg4: string) => any;
}

interface MinePermitTableItem {
  permit: IPermit | IPermitAmendment;
  permitAmendmentDocuments: IMineDocument[];
  is_generated_in_core: boolean;
  amendmentNumber: string;
  conditions: any;
  description: string;
}

const renderDocumentLink = (document, linkTitleOverride = null) => (
  <DocumentLink
    documentManagerGuid={document.document_manager_guid}
    documentName={document.document_name}
    linkTitleOverride={linkTitleOverride}
  />
);

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

const renderPermitNo = (permit) => {
  const permitNoShouldLinkToDocument =
    permit.permit_amendments[0] &&
    permit.permit_amendments[0].permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated &&
    permit.permit_amendments[0].related_documents[0];
  return permitNoShouldLinkToDocument
    ? renderDocumentLink(permit.permit_amendments[0].related_documents[0], permit.permit_no)
    : permit.permit_no;
};

export const MinePermitTable: React.FC<MinePermitTableProps> = ({
  openEditAmendmentModal,
  handleDeletePermitAmendment,
  handlePermitAmendmentIssueVC,
  openViewConditionModal,
  openEditPermitModal,
  openAddPermitAmendmentModal,
  openAddAmalgamatedPermitModal,
  handleDeletePermit,
  openAddPermitHistoricalAmendmentModal,
  openEditSitePropertiesModal,
  permits,
  isLoaded,
  expandedRowKeys,
  onExpand,
}) => {
  const history = useHistory();
  const { isFeatureEnabled } = useFeatureFlag();
  const { id } = useParams<{ id: string }>();

  const permitStatusOptionsHash = useSelector(getDropdownPermitStatusOptionsHash);
  const permitAmendmentTypeOptionsHash = useSelector(getPermitAmendmentTypeOptionsHash);

  const userCanEditPermits = useSelector((state) =>
    userHasRole(state, USER_ROLES.role_edit_permits)
  );
  const userIsAdmin = useSelector((state) => userHasRole(state, USER_ROLES.role_admin));
  const userHistorical = useSelector((state) =>
    userHasRole(state, USER_ROLES.role_edit_historical_amendments)
  );
  const userSecurities = useSelector((state) =>
    userHasRole(state, USER_ROLES.role_edit_securities)
  );

  const transformRowData = (permit) => {
    const latestAmendment = permit.permit_amendments.filter(
      (a) => a.permit_amendment_status_code !== draftAmendment
    )[0];
    const firstAmendment = permit.permit_amendments[permit.permit_amendments.length - 1];

    const hasAmalgamated = permit.permit_amendments.find(
      (pa) => pa.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated
    );

    return {
      ...permit,
      permit,
      key: permit.permit_guid,
      lastAmended:
        (latestAmendment && formatDate(latestAmendment.issue_date)) || Strings.EMPTY_FIELD,
      lastAmendedVC: latestAmendment?.vc_credential_exch_state,
      permitNo: permit.permit_no || Strings.EMPTY_FIELD,
      firstIssued: (firstAmendment && formatDate(firstAmendment.issue_date)) || Strings.EMPTY_FIELD,
      permittee: permit.current_permittee,
      permit_amendments: permit.permit_amendments.filter(
        (a) => a.permit_amendment_status_code !== draftAmendment
      ),
      status: permit.permit_status_code,
      hasAmalgamated,
    };
  };

  const transformChildRowData = (amendment, record, amendmentNumber, mineGuid) => ({
    amendmentNumber,
    permit: record.permit,
    ...amendment,
    isAmalgamated: amendment.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated,
    receivedDate: formatDate(amendment.received_date) || Strings.EMPTY_FIELD,
    issueDate: formatDate(amendment.issue_date) || Strings.EMPTY_FIELD,
    authorizationEndDate: formatDate(amendment.authorization_end_date) || Strings.EMPTY_FIELD,
    description: amendment.description || Strings.EMPTY_FIELD,
    isAssociatedWithNOWApplicationImportedToCore: "",
    finalApplicationPackage: finalApplicationPackage(amendment),
    maps: amendment.now_application_documents?.filter(
      (doc) => doc.now_application_document_sub_type_code === "MDO"
    ),
    documents: amendment.related_documents,
    permitAmendmentDocuments: amendment.related_documents.map((doc) => ({
      key: doc.mine_report_submission_guid,
      documentManagerGuid: doc.document_manager_guid,
      filename: doc.document_name,
    })),
    mineGuid,
  });

  // EDIT_PERMITS required for *every* item- enforced at menu-level
  const actions: ITableAction[] = [
    isFeatureEnabled(Feature.DIGITIZED_PERMITS) && {
      key: "view",
      label: "View",
      clickFunction: (_, record) =>
        history.push(
          VIEW_MINE_PERMIT.dynamicRoute(
            id,
            record.permit.permit_guid ?? record.permit.permit_amendment_guid
          )
        ),
      icon: <EyeOutlined />,
    },
    {
      key: "amalgamate-amend",
      label: "Add Permit Amendment",
      icon: <PlusOutlined />,
      clickFunction: (event, record) => openAddAmalgamatedPermitModal(event, record.permit),
    },
    {
      key: "amalgamate",
      label: "Amalgamate Permit",
      icon: <PlusOutlined />,
      clickFunction: (event, record) => openAddAmalgamatedPermitModal(event, record.permit),
    },
    {
      key: "add-amendment",
      label: "Add Permit Amendment",
      icon: <PlusOutlined />,
      clickFunction: (event, record) => openAddPermitAmendmentModal(event, record.permit),
    },
    userHistorical && {
      key: "add-historical-amend",
      label: "Add Permit Historical Amendment",
      icon: <PlusOutlined />,
      clickFunction: (event, record) => openAddPermitHistoricalAmendmentModal(event, record.permit),
    },
    userSecurities && {
      key: "edit-permit-status",
      label: "Edit Permit Status",
      icon: <EditOutlined />,
      clickFunction: (event, record) => openEditPermitModal(event, record.permit),
    },
    userCanEditPermits && {
      key: "edit-site-properties",
      label: "Edit Site Properties",
      icon: <EditOutlined />,
      clickFunction: (event, record) => openEditSitePropertiesModal(event, record.permit),
    },
    userIsAdmin && {
      key: "delete-permit",
      label: "Delete",
      icon: <DeleteOutlined />,
      clickFunction: (_, record) => {
        const isLinkedToNowApplication =
          (record.permit as IPermit).permit_amendments.filter(
            (amendment) =>
              !isEmpty(amendment.now_application_guid) && amendment.is_generated_in_core
          ).length > 0;

        const isAnyBondsAssociatedTo = (record.permit as IPermit)?.bonds?.length > 0;
        const isDeletionAllowed = !isAnyBondsAssociatedTo && !isLinkedToNowApplication;
        const issues = [];

        if (!isDeletionAllowed) {
          if (isLinkedToNowApplication) {
            issues.push(
              "Permit has amendments generated in Core which are associated with a NoW application."
            );
          }
          if (isAnyBondsAssociatedTo) {
            issues.push("Permit has associated bond records.");
          }
        }

        const title =
          issues.length > 0
            ? "You cannot delete this permit due to the following issues:"
            : "Are you sure you want to delete this permit and all related permit amendments and permit documents?";
        const content =
          issues.length > 0 ? (
            <div style={{ whiteSpace: "pre-wrap" }}>
              <ul>
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : null;
        const onOk = isDeletionAllowed
          ? () => handleDeletePermit((record.permit as IPermit).permit_guid)
          : () => {};
        return Modal.confirm({
          title,
          content,
          onOk,
          okText: isDeletionAllowed ? "Delete" : "Ok",
          cancelText: "Cancel",
        });
      },
    },
  ].filter(Boolean);

  const recordActionsFilter = (record, actionItems) => {
    const filterOut = record.hasAmalgamated
      ? ["amalgamate", "add-amendment"]
      : ["amalgamate-amend"];
    return actionItems.filter(({ key }) => !filterOut.includes(key));
  };

  const actionsMenu = renderActionsColumn({ actions, recordActionsFilter });

  const columns: ColumnsType<MinePermitTableItem> = [
    {
      title: "Permit No.",
      key: "permitNo",
      render: (record) => <div title="Permit No.">{renderPermitNo(record.permit)}</div>,
    },
    renderCategoryColumn("status", "Status", permitStatusOptionsHash),
    renderTextColumn("permittee", "Permittee"),
    renderTextColumn("firstIssued", "First Issued"),
    renderTextColumn("lastAmended", "Last Amended"),
    userCanEditPermits && actionsMenu,
  ];

  const handleNavigateToPermitConditions = (record) => {
    return history.push(
      route.EDIT_PERMIT_CONDITIONS.dynamicRoute(record.mineGuid, record.permit_amendment_guid)
    );
  };

  // from DownloadAllDocumentsButton/MineReportTable.js - I think there is a new way to accomplish this
  const handleDownloadAll = (record) => {
    const documents = record.documents;
    const docURLS = [];

    const totalFiles = documents.length;
    if (totalFiles === 0) {
      return;
    }
    documents.forEach((doc) =>
      getDocumentDownloadToken(doc.document_manager_guid, doc.document_name, docURLS)
    );

    waitFor(() => docURLS.length === documents.length).then(async () => {
      for (const url of docURLS) {
        downloadDocument(url);

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      notification.success({
        message: `Successfully Downloaded: ${totalFiles} files.`,
        duration: 10,
      });
    });
  };

  const childActions: ITableAction[] = [
    userCanEditPermits && {
      key: "edit",
      label: "Edit",
      icon: <EditOutlined />,
      clickFunction: (event, record) =>
        openEditAmendmentModal(event, record, record.permit as IPermit),
    },
    {
      key: "view-permit-conditions",
      label: "View Permit Conditions",
      clickFunction: (event, record) =>
        openViewConditionModal(
          event,
          record.conditions,
          record.amendmentNumber,
          record.permit.permit_no
        ),
      icon: <ReadOutlined />,
    },
    userCanEditPermits && {
      key: "edit-permit-conditions",
      label: "Edit Permit Conditions",
      icon: <EditOutlined />,
      clickFunction: (_, record) => handleNavigateToPermitConditions(record),
    },
    {
      key: "download-all",
      label: "Download All",
      icon: <DownloadOutlined />,
      clickFunction: (_, record) => {
        handleDownloadAll(record);
      },
    },
    userIsAdmin && {
      key: "delete",
      label: "Delete",
      icon: <DeleteOutlined />,
      clickFunction: (_, record) => {
        const isLinkedToNowApplication =
          !isEmpty(record.now_application_guid) && record.is_generated_in_core;

        let title = "Are you sure you want to delete this amendment and all related documents?";
        let okText = "Delete";
        let onOk = () => handleDeletePermitAmendment(record);
        if (isLinkedToNowApplication) {
          title =
            "You cannot delete permit amendment generated in Core with associated NoW application.";
          okText = "Ok";
          onOk = () => {};
        }
        return Modal.confirm({ title, okText, cancelText: "Cancel", onOk });
      },
    },
    userIsAdmin && {
      key: "verify",
      label: "Verify",
      clickFunction: (event, record) => {
        return Modal.confirm({
          title: `Are you sure you want to Issue this permit as a Verifiable Credential to OrgBook entity: ${record.permit.current_permittee}?`,
          okText: "Issue",
          cancelText: "Cancel",
          onOk: () => handlePermitAmendmentIssueVC(event, record, record.permit),
        });
      },
      icon: <SafetyCertificateOutlined />,
    },
  ].filter(Boolean);

  const childActionsFilter = (record, actionItems) => {
    let filtered = actionItems;
    if (record.amendmentType === PERMIT_AMENDMENT_TYPES.original) {
      filtered = filtered.filter((a) => a.key !== "delete");
    }
    if (record.is_generated_in_core) {
      filtered = filtered.filter((a) => a.key !== "edit-permit-conditions");
    }
    return filtered;
  };

  const childActionsMenu = renderActionsColumn({
    actions: childActions,
    recordActionsFilter: childActionsFilter,
  });

  const childColumns: ColumnsType<MinePermitTableItem> = [
    {
      title: "#",
      dataIndex: "amendmentNumber",
      key: "amendmentNumber",
      width: "30px",
      render: (text) => <div title="Amendment">{text}</div>,
    },
    {
      ...renderTextColumn("permit_amendment_type_code", "Type", permitAmendmentTypeOptionsHash),
      width: "130px",
    },
    { ...renderTextColumn("issueDate", "Date Issued"), width: "130px" },
    { ...renderTextColumn("authorizationEndDate", "Authorization End Date"), width: "250px" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <div title="Description">
          <p className="wrapped-text" style={{ maxWidth: "800px" }}>
            {text}
          </p>
        </div>
      ),
    },
    {
      title: "Permit Package",
      dataIndex: "finalApplicationPackage",
      key: "finalApplicationPackage",
      render: (text) => (
        <div title="Permit Package">
          <ul>
            {text?.map((file) => (
              <li key={file.document_manager_guid} className="wrapped-text">
                {renderDocumentLink(file.mine_document)}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: "Permit Files",
      dataIndex: "documents",
      key: "documents",
      render: (text) => (
        <div title="Permit Files">
          <ul>
            {text?.map((file) => (
              <li key={file.document_manager_guid} className="wrapped-text">
                {renderDocumentLink(file)}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    childActionsMenu,
  ];

  const permitColumns = [...columns];

  const amendmentHistory = (permit) => {
    return permit?.permit_amendments?.map((amendment, index) =>
      transformChildRowData(amendment, permit, permit.permit_amendments.length - index, id)
    );
  };

  const rowData = permits?.map((permit) => transformRowData(permit));

  return (
    <CoreTable
      condition={isLoaded}
      dataSource={rowData}
      columns={permitColumns}
      classPrefix="permits"
      expandProps={{
        rowKey: "permit_amendment_guid",
        recordDescription: "amendment history",
        getDataSource: amendmentHistory,
        subTableColumns: childColumns,
        expandedRowKeys: expandedRowKeys,
        onExpand: onExpand,
      }}
    />
  );
};

export default MinePermitTable;

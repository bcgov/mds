import React, { FC } from "react";
import { withRouter, Link, RouteComponentProps } from "react-router-dom";
import { Table, Menu, Dropdown, Button, Popconfirm } from "antd";
import { PlusOutlined, SafetyCertificateOutlined, ReadOutlined } from "@ant-design/icons";
import { connect } from "react-redux";

import { formatDate } from "@common/utils/helpers";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import {
  getDropdownPermitStatusOptionsHash,
  getPermitAmendmentTypeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import * as Strings from "@common/constants/strings";
import { isEmpty } from "lodash";
import { PERMIT_AMENDMENT_TYPES } from "@common/constants/strings";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { EDIT_OUTLINE_VIOLET, EDIT, CARAT, TRASHCAN } from "@/constants/assets";
import CoreTable from "@/components/common/CoreTable";
import DocumentLink from "@/components/common/DocumentLink";
import DownloadAllDocumentsButton from "@/components/common/buttons/DownloadAllDocumentsButton";
import * as route from "@/constants/routes";
import { IPermit, IPermitPartyRelationship, IPermitAmendment } from "@mds/common";
import { ColumnsType } from "antd/lib/table";

/**
 * @class  MinePermitTable - displays a table of permits and permit amendments
 */

const draftAmendment = "DFT";

interface MinePermitTableProps {
  permits: IPermit[];
  partyRelationships?: IPermitPartyRelationship[];
  permitStatusOptionsHash?: any;
  major_mine_ind: boolean;
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
  permitAmendmentTypeOptionsHash?: any;
  openEditSitePropertiesModal: (arg1: any, arg2: IPermit) => any;
  openViewConditionModal: (arg1: any, arg2: any, arg3: any, arg4: string) => any;
  match: any;
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

const renderDeleteButtonForPermitAmendments = (record) => {
  if (record.amendmentType === PERMIT_AMENDMENT_TYPES.original) {
    return;
  }

  const isLinkedToNowApplication =
    !isEmpty(record.now_application_guid) && record.is_generated_in_core;

  // eslint-disable-next-line consistent-return
  return (
    <AuthorizationWrapper permission={Permission.ADMIN}>
      <Popconfirm
        placement="topLeft"
        title={
          isLinkedToNowApplication
            ? "You cannot delete permit amendment generated in Core with associated NoW application."
            : "Are you sure you want to delete this amendment and all related documents?"
        }
        okText={isLinkedToNowApplication ? "Ok" : "Delete"}
        cancelText="Cancel"
        onConfirm={
          isLinkedToNowApplication ? () => {} : () => record.handleDeletePermitAmendment(record)
        }
      >
        <div className="custom-menu-item">
          <button type="button" className="full add-permit-dropdown-button">
            <img
              src={TRASHCAN}
              alt="Remove Permit Amendment"
              className="icon-sm padding-sm--right violet"
            />
            Delete
          </button>
        </div>
      </Popconfirm>
    </AuthorizationWrapper>
  );
};

const renderVerifyCredentials = (text, record) => {
  return (
    <AuthorizationWrapper permission={Permission.ADMIN}>
      <Popconfirm
        placement="topLeft"
        title={`Are you sure you want to Issue this permit as a Verifiable Credential to OrgBook entity: ${record.permit.current_permittee}?`}
        onConfirm={(event) => record.handlePermitAmendmentIssueVC(event, record, record.permit)}
        okText="Issue"
        cancelText="Cancel"
      >
        <div className="custom-menu-item">
          <button type="button" className="full add-permit-dropdown-button">
            <SafetyCertificateOutlined className="icon-sm padding-md--right violet" />
            Verify
          </button>
        </div>
      </Popconfirm>
    </AuthorizationWrapper>
  );
};

const renderEditPermitConditions = (text, record) => {
  return (
    <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
      <div className="custom-menu-item">
        <Link
          to={route.EDIT_PERMIT_CONDITIONS.dynamicRoute(
            record.mineGuid,
            record.permit_amendment_guid
          )}
        >
          <button
            type="button"
            className="full add-permit-dropdown-button"
            style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.65)" }}
          >
            <img
              src={EDIT_OUTLINE_VIOLET}
              alt="Edit"
              className="icon-sm padding-sm--right violet"
            />
            Edit Permit Conditions
          </button>
        </Link>
      </div>
    </AuthorizationWrapper>
  );
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

const columns = [
  {
    title: "Permit No.",
    dataIndex: "permitNo",
    key: "permitNo",
    render: (text, record) => <div title="Permit No.">{renderPermitNo(record.permit)}</div>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (text, record) => <div title="Status">{record.permitStatusOptionsHash[text]}</div>,
  },
  {
    title: "Permittee",
    dataIndex: "permittee",
    key: "permittee",
    render: (text) => <div title="Permittee">{text}</div>,
  },
  {
    title: "First Issued",
    dataIndex: "firstIssued",
    key: "firstIssued",
    render: (text) => <div title="First Issued">{text}</div>,
  },
  {
    title: "Last Amended",
    dataIndex: "lastAmended",
    key: "lastAmended",
    render: (text) => <div title="Last Amended">{text}</div>,
  },
  {
    title: "",
    dataIndex: "addEditButton",
    key: "addEditButton",
    align: "right",
    render: (text, record) => {
      const menu = (
        <Menu>
          <Menu.Item key="0">
            <button
              type="button"
              className="full add-permit-dropdown-button"
              onClick={(event) => record.openAddAmalgamatedPermitModal(event, record.permit)}
            >
              <div>
                <PlusOutlined className="padding-sm add-permit-dropdown-button-icon" />
                {text.hasAmalgamated ? "Add Permit Amendment" : "Amalgamate Permit"}
              </div>
            </button>
          </Menu.Item>
          {!text.hasAmalgamated && (
            <Menu.Item key="1">
              <button
                type="button"
                className="full add-permit-dropdown-button"
                onClick={(event) => record.openAddPermitAmendmentModal(event, record.permit)}
              >
                <div>
                  <PlusOutlined className="padding-sm add-permit-dropdown-button-icon" />
                  Add Permit Amendment
                </div>
              </button>
            </Menu.Item>
          )}
          <AuthorizationWrapper permission={Permission.EDIT_HISTORICAL_AMENDMENTS}>
            <div className="custom-menu-item">
              <button
                type="button"
                className="full add-permit-dropdown-button"
                onClick={(event) =>
                  record.openAddPermitHistoricalAmendmentModal(event, record.permit)
                }
              >
                <div>
                  <PlusOutlined className="padding-sm add-permit-dropdown-button-icon" />
                  Add Permit Historical Amendment
                </div>
              </button>
            </div>
          </AuthorizationWrapper>
          <AuthorizationWrapper permission={Permission.EDIT_SECURITIES}>
            <div className="custom-menu-item">
              <button
                type="button"
                className="full"
                onClick={(event) =>
                  record.openEditPermitModal(event, record.permit, record.description)
                }
              >
                <img
                  alt="document"
                  className="padding-sm"
                  src={EDIT_OUTLINE_VIOLET}
                  style={{ paddingRight: "15px" }}
                />
                Edit Permit Status
              </button>
            </div>
          </AuthorizationWrapper>
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <div className="custom-menu-item">
              <button
                type="button"
                className="full"
                onClick={(event) => record.openEditSitePropertiesModal(event, record.permit)}
              >
                <img
                  alt="document"
                  className="padding-sm"
                  src={EDIT_OUTLINE_VIOLET}
                  style={{ paddingRight: "15px" }}
                />
                Edit Site Properties
              </button>
            </div>
          </AuthorizationWrapper>
        </Menu>
      );

      const isLinkedToNowApplication =
        record.permit.permit_amendments.filter(
          (amendment) => !isEmpty(amendment.now_application_guid) && amendment.is_generated_in_core
        ).length > 0;

      const isAnyBondsAssociatedTo = record.permit.bonds && record.permit.bonds.length > 0;

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

      const deletePermitPopUp = (
        <Popconfirm
          placement="topLeft"
          title={
            issues && issues.length > 0 ? (
              <div style={{ whiteSpace: "pre-wrap" }}>
                <p>You cannot delete this permit due to following issues:</p>
                <ul>
                  {issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            ) : (
              "Are you sure you want to delete this permit and all related permit amendments and permit documents?"
            )
          }
          onConfirm={
            isDeletionAllowed
              ? () => record.handleDeletePermit(record.permit.permit_guid)
              : () => {}
          }
          okText={isDeletionAllowed ? "Delete" : "Ok"}
          cancelText="Cancel"
        >
          <Button ghost type="primary" size="small">
            <img src={TRASHCAN} alt="Remove Permit" />
          </Button>
        </Popconfirm>
      );

      return (
        <div className="btn--middle flex">
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            {/* @ts-ignore */}
            <Dropdown className="full-height full-mobile" overlay={menu} placement="bottomLeft">
              {/* @ts-ignore */}
              <Button type="secondary" className="permit-table-button">
                <div className="padding-sm">
                  <img className="padding-sm--right icon-svg-filter" src={EDIT} alt="Add/Edit" />
                  Add/Edit
                  <img
                    className="padding-sm--right icon-svg-filter"
                    src={CARAT}
                    alt="Menu"
                    style={{ paddingLeft: "5px" }}
                  />
                </div>
              </Button>
            </Dropdown>
          </AuthorizationWrapper>
          <AuthorizationWrapper permission={Permission.ADMIN}>
            {deletePermitPopUp}
          </AuthorizationWrapper>
        </div>
      );
    },
  },
];

const childColumns: ColumnsType<IPermit> = [
  {
    title: "#",
    dataIndex: "amendmentNumber",
    key: "amendmentNumber",
    width: "30px",
    render: (text) => <div title="Amendment">{text}</div>,
  },
  {
    title: "Type",
    dataIndex: "permit_amendment_type_code",
    key: "permit_amendment_type_code",
    width: "130px",
    render: (text, record) => <div title="Type">{record.permitAmendmentTypeOptionsHash[text]}</div>,
  },
  {
    title: "Date Issued",
    dataIndex: "issueDate",
    key: "issueDate",
    width: "130px",
    render: (text) => <div title="Issue Date">{text}</div>,
  },
  {
    title: "Authorization End Date",
    dataIndex: "authorizationEndDate",
    key: "authorizationEndDate",
    width: "250px",
    render: (text) => <div title="Authorization End Date">{text}</div>,
  },
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
          {text?.map((file, index) => (
            <li key={index} className="wrapped-text">
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
          {text?.map((file, index) => (
            <li key={index} className="wrapped-text">
              {renderDocumentLink(file)}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "operations",
    key: "operations",
    align: "right",
    render: (text, record) => {
      const menu = (
        <Menu>
          <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
            <Menu.Item key="0">
              <div className="custom-menu-item">
                <button
                  type="button"
                  className="full add-permit-dropdown-button"
                  onClick={(event) => record.openEditAmendmentModal(event, record, record.permit)}
                >
                  <img
                    src={EDIT_OUTLINE_VIOLET}
                    alt="Edit"
                    className="icon-sm padding-sm--right violet"
                    style={{ paddingLeft: "13px" }}
                  />
                  Edit
                </button>
              </div>
            </Menu.Item>
          </AuthorizationWrapper>
          <Menu.Item key="1">
            <div className="custom-menu-item">
              <button
                type="button"
                className="full add-permit-dropdown-button"
                onClick={(event) =>
                  record.openViewConditionModal(
                    event,
                    record.conditions,
                    record.amendmentNumber,
                    record.permit.permit_no
                  )
                }
              >
                <ReadOutlined className="padding-md--right icon-sm violet" />
                View Permit Conditions
              </button>
            </div>
          </Menu.Item>
          {!record.is_generated_in_core && (
            <Menu.Item key="2">{renderEditPermitConditions(text, record)}</Menu.Item>
          )}
          <Menu.Item key="3">
            <DownloadAllDocumentsButton documents={record.permitAmendmentDocuments} />
          </Menu.Item>
          <Menu.Item key="4">{renderDeleteButtonForPermitAmendments(record)}</Menu.Item>
          <Menu.Item key="5">{renderVerifyCredentials(text, record)}</Menu.Item>
        </Menu>
      );
      return (
        <div>
          {/* @ts-ignore */}
          <Dropdown overlay={menu} placement="bottomLeft">
            {/* @ts-ignore */}
            <Button type="secondary" className="permit-table-button">
              Actions
              <img
                className="padding-sm--right icon-svg-filter"
                src={CARAT}
                alt="Menu"
                style={{ paddingLeft: "5px" }}
              />
            </Button>
          </Dropdown>
        </div>
      );
    },
  },
];

const transformRowData = (
  permit,
  partyRelationships,
  major_mine_ind,
  openEditPermitModal,
  openAddPermitAmendmentModal,
  openAddAmalgamatedPermitModal,
  permitStatusOptionsHash,
  handleDeletePermit,
  handleDeletePermitAmendment,
  openAddPermitHistoricalAmendmentModal,
  openEditSitePropertiesModal
) => {
  const latestAmendment = permit.permit_amendments.filter(
    (a) => a.permit_amendment_status_code !== draftAmendment
  )[0];
  const firstAmendment = permit.permit_amendments[permit.permit_amendments.length - 1];

  const hasAmalgamated = permit.permit_amendments.find(
    (pa) => pa.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated
  );

  return {
    key: permit.permit_guid,
    lastAmended: (latestAmendment && formatDate(latestAmendment.issue_date)) || Strings.EMPTY_FIELD,
    permitNo: permit.permit_no || Strings.EMPTY_FIELD,
    firstIssued: (firstAmendment && formatDate(firstAmendment.issue_date)) || Strings.EMPTY_FIELD,
    permittee: permit.current_permittee,
    permit_amendments: permit.permit_amendments.filter(
      (a) => a.permit_amendment_status_code !== draftAmendment
    ),
    status: permit.permit_status_code,
    addEditButton: {
      major_mine_ind,
      hasAmalgamated,
    },
    openEditPermitModal,
    openAddPermitAmendmentModal,
    openAddAmalgamatedPermitModal,
    permitStatusOptionsHash,
    permit,
    handleDeletePermit,
    handleDeletePermitAmendment,
    openAddPermitHistoricalAmendmentModal,
    openEditSitePropertiesModal,
  };
};

const transformChildRowData = (
  amendment,
  record,
  amendmentNumber,
  major_mine_ind,
  openEditAmendmentModal,
  handleDeletePermitAmendment,
  handlePermitAmendmentIssueVC,
  permitAmendmentTypeOptionsHash,
  openViewConditionModal,
  mineGuid
) => ({
  amendmentNumber,
  isAmalgamated: amendment.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated,
  receivedDate: formatDate(amendment.received_date) || Strings.EMPTY_FIELD,
  issueDate: formatDate(amendment.issue_date) || Strings.EMPTY_FIELD,
  authorizationEndDate: formatDate(amendment.authorization_end_date) || Strings.EMPTY_FIELD,
  description: amendment.description || Strings.EMPTY_FIELD,
  isAssociatedWithNOWApplicationImportedToCore: "",
  openEditAmendmentModal,
  openViewConditionModal,
  permit: record.permit,
  documents: amendment.related_documents,
  handleDeletePermitAmendment,
  handlePermitAmendmentIssueVC,
  finalApplicationPackage: finalApplicationPackage(amendment),
  maps: amendment.now_application_documents?.filter(
    (doc) => doc.now_application_document_sub_type_code === "MDO"
  ),
  permitAmendmentTypeOptionsHash,
  permitAmendmentDocuments: amendment.related_documents.map((doc) => ({
    key: doc.mine_report_submission_guid,
    documentManagerGuid: doc.document_manager_guid,
    filename: doc.document_name,
  })),
  mineGuid,
  ...amendment,
});

export const MinePermitTable: React.FC<RouteComponentProps & MinePermitTableProps> = (props) => {
  const amendmentHistory = (permit) => {
    const childRowData = permit?.permit_amendments?.map((amendment, index) =>
      transformChildRowData(
        amendment,
        permit,
        permit.permit_amendments.length - index,
        props.major_mine_ind,
        props.openEditAmendmentModal,
        props.handleDeletePermitAmendment,
        props.handlePermitAmendmentIssueVC,
        props.permitAmendmentTypeOptionsHash,
        props.openViewConditionModal,
        props.match.params.id
      )
    );

    return <Table pagination={false} columns={childColumns} dataSource={childRowData} />;
  };

  const rowData = props.permits?.map((permit) =>
    transformRowData(
      permit,
      props.partyRelationships,
      props.major_mine_ind,
      props.openEditPermitModal,
      props.openAddPermitAmendmentModal,
      props.openAddAmalgamatedPermitModal,
      props.permitStatusOptionsHash,
      props.handleDeletePermit,
      props.handleDeletePermitAmendment,
      props.openAddPermitHistoricalAmendmentModal,
      props.openEditSitePropertiesModal
    )
  );

  return (
    <CoreTable
      condition={props.isLoaded}
      dataSource={rowData}
      columns={columns}
      recordType="amendment history"
      tableProps={{
        className: "nested-table",
        rowClassName: "table-row-align-middle pointer fade-in",
        align: "left",
        pagination: false,
        expandRowByClick: true,
        expandedRowRender: amendmentHistory,
        expandedRowKeys: props.expandedRowKeys,
        onExpand: props.onExpand,
      }}
    />
  );
};

const mapStateToProps = (state) => ({
  partyRelationships: getPartyRelationships(state),
  permitStatusOptionsHash: getDropdownPermitStatusOptionsHash(state),
  permitAmendmentTypeOptionsHash: getPermitAmendmentTypeOptionsHash(state),
});

export default withRouter(
  connect(mapStateToProps)(MinePermitTable) as FC<MinePermitTableProps & RouteComponentProps>
);

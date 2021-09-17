import React, { Component } from "react";
import { Table, Menu, Dropdown, Button, Tooltip, Popconfirm } from "antd";
import {
  MinusSquareFilled,
  PlusOutlined,
  PlusSquareFilled,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { formatDate } from "@common/utils/helpers";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import {
  getDropdownPermitStatusOptionsHash,
  getPermitAmendmentTypeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import * as Strings from "@common/constants/strings";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_OUTLINE_VIOLET, EDIT, CARAT, TRASHCAN } from "@/constants/assets";
import CoreTable from "@/components/common/CoreTable";
import { isEmpty } from "lodash";
import { PERMIT_AMENDMENT_TYPES } from "@common/constants/strings";
import DocumentLink from "@/components/common/DocumentLink";
import DownloadAllDocuments from "@/components/common/DownloadAllDocuments";

/**
 * @class  MinePermitTable - displays a table of permits and permit amendments
 */

const draftAmendment = "DFT";

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  permitStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  major_mine_ind: PropTypes.bool.isRequired,
  openEditPermitModal: PropTypes.func.isRequired,
  openAddPermitAmendmentModal: PropTypes.func.isRequired,
  openAddAmalgamatedPermitModal: PropTypes.func.isRequired,
  openAddPermitHistoricalAmendmentModal: PropTypes.func.isRequired,
  // This prop is used. Linting issue is unclear
  openEditAmendmentModal: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  expandedRowKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  onExpand: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  handleDeletePermit: PropTypes.func.isRequired,
  handleDeletePermitAmendment: PropTypes.func.isRequired,
  handlePermitAmendmentIssueVC: PropTypes.func.isRequired,
  permitAmendmentTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  openEditSitePropertiesModal: PropTypes.func.isRequired,
};

const defaultProps = {
  partyRelationships: [],
};

export class MinePermitTable extends Component {
  renderDocumentLink = (document, linkTitleOverride = null) => (
    <DocumentLink
      documentManagerGuid={document.document_manager_guid}
      documentName={document.document_name}
      linkTitleOverride={linkTitleOverride}
    />
  );

  finalApplicationPackage = (amendment) => {
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

  renderDeleteButtonForPermitAmendments = (record) => {
    if (record.amendmentType === PERMIT_AMENDMENT_TYPES.original) {
      return;
    }

    const isLinkedToNowApplication = !isEmpty(record.operations.amendment.now_application_guid);

    // eslint-disable-next-line consistent-return
    return (
      <AuthorizationWrapper permission={Permission.ADMIN}>
        <Popconfirm
          placement="topLeft"
          title={
            isLinkedToNowApplication
              ? "You cannot delete permit amendment with associated NoW application imported to Core."
              : "Are you sure you want to delete this amendment and all related documents?"
          }
          okText={isLinkedToNowApplication ? "Ok" : "Delete"}
          cancelText="Cancel"
          onConfirm={
            isLinkedToNowApplication ? () => {} : () => record.handleDeletePermitAmendment(record)
          }
        >
          <div className="custom-menu-item">
            <button type="button" className="full">
              <img
                src={TRASHCAN}
                alt="Remove Permit Amendment"
                className="padding-sm"
                style={{ paddingRight: "15px" }}
              />
              Delete
            </button>
          </div>
        </Popconfirm>
      </AuthorizationWrapper>
    );
  };

  renderVerifyCredentials = (text, record) => {
    return (
      <AuthorizationWrapper permission={Permission.ADMIN}>
        <Popconfirm
          placement="topLeft"
          title={`Are you sure you want to Issue this permit as a Verifiable Credential to OrgBook entity: ${record.permit.current_permittee}?`}
          onConfirm={(event) =>
            record.handlePermitAmendmentIssueVC(event, text.amendment, record.permit)
          }
          okText="Issue"
          cancelText="Cancel"
        >
          <div className="custom-menu-item">
            <button type="primary" className="full add-permit-dropdown-button">
              <SafetyCertificateOutlined
                className="padding-sm add-permit-dropdown-button-icon"
                style={{ color: "#5e46a1" }}
              />
              Verify
            </button>
          </div>
        </Popconfirm>
      </AuthorizationWrapper>
    );
  };

  renderPermitNo = (permit) => {
    const permitNoShouldLinkToDocument =
      permit.permit_amendments[0] &&
      permit.permit_amendments[0].permit_amendment_type_code ===
        PERMIT_AMENDMENT_TYPES.amalgamated &&
      permit.permit_amendments[0].related_documents[0];
    return permitNoShouldLinkToDocument
      ? this.renderDocumentLink(permit.permit_amendments[0].related_documents[0], permit.permit_no)
      : permit.permit_no;
  };

  columns = [
    {
      title: "Permit No.",
      dataIndex: "permitNo",
      key: "permitNo",
      render: (text, record) => <div title="Permit No.">{this.renderPermitNo(record.permit)}</div>,
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
            (amendment) => !isEmpty(amendment.now_application_guid)
          ).length > 0;

        const isAnyBondsAssociatedTo = record.permit.bonds && record.permit.bonds.length > 0;

        const isDeletionAllowed = !isAnyBondsAssociatedTo && !isLinkedToNowApplication;

        const issues = [];

        if (!isDeletionAllowed) {
          if (isLinkedToNowApplication) {
            issues.push(
              "Permit has amendments associated with a NoW application imported to Core."
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
                    {issues.map((issue) => (
                      <li>{issue}</li>
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
              <img name="remove" src={TRASHCAN} alt="Remove Permit" />
            </Button>
          </Popconfirm>
        );

        return (
          <div className="btn--middle flex">
            <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
              <Dropdown className="full-height full-mobile" overlay={menu} placement="bottomLeft">
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

  childColumns = [
    {
      title: "#",
      dataIndex: "amendmentNumber",
      key: "amendmentNumber",
      width: "30px",
      render: (text) => <div title="Amendment">{text}</div>,
    },
    {
      title: "Type",
      dataIndex: "amendmentType",
      key: "amendmentType",
      width: "130px",
      render: (text, record) => (
        <div title="Type">{record.permitAmendmentTypeOptionsHash[text]}</div>
      ),
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
      title: "Maps",
      dataIndex: "maps",
      key: "maps",
      render: (text) => (
        <div title="Maps">
          <ul>
            {text?.map((file) => (
              <li className="wrapped-text">{this.renderDocumentLink(file.mine_document)}</li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: "Final Application Package",
      dataIndex: "finalApplicationPackage",
      key: "finalApplicationPackage",
      render: (text) => (
        <div title="Final Application Package">
          <ul>
            {text?.map((file) => (
              <li className="wrapped-text">{this.renderDocumentLink(file.mine_document)}</li>
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
              <li className="wrapped-text">{this.renderDocumentLink(file)}</li>
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
        const permitAmendmentSubmissions = record.permit.permit_amendments[0].related_documents.map(
          (doc) => ({
            key: doc.mine_report_submission_guid,
            documentManagerGuid: doc.document_manager_guid,
            filename: doc.document_name,
          })
        );
        const menu = (
          <Menu>
            <AuthorizationWrapper permission={Permission.ADMIN}>
              <Menu.Item key="0">
                <div className="custom-menu-item">
                  <button
                    type="button"
                    className="full"
                    onClick={(event) =>
                      this.props.openEditAmendmentModal(
                        event,
                        this.props.permitAmendment,
                        this.props.permit
                      )
                    }
                  >
                    <img
                      src={EDIT_OUTLINE_VIOLET}
                      alt="Edit"
                      className="padding-sm"
                      style={{ paddingRight: "15px" }}
                    />
                    Edit
                  </button>
                </div>
              </Menu.Item>
            </AuthorizationWrapper>
            <Menu.Item key="1">
              <DownloadAllDocuments submissions={permitAmendmentSubmissions} />
            </Menu.Item>
            <Menu.Item key="2">{this.renderDeleteButtonForPermitAmendments(record)}</Menu.Item>
            <Menu.Item key="3">{this.renderVerifyCredentials(text, record)}</Menu.Item>
          </Menu>
        );
        return (
          <div>
            <Dropdown overlay={menu} placement="bottomLeft">
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

  transformRowData = (
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
      lastAmended:
        (latestAmendment && formatDate(latestAmendment.issue_date)) || Strings.EMPTY_FIELD,
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

  transformChildRowData = (
    amendment,
    record,
    amendmentNumber,
    major_mine_ind,
    openEditAmendmentModal,
    handleDeletePermitAmendment,
    handlePermitAmendmentIssueVC,
    permitAmendmentTypeOptionsHash
  ) => ({
    amendmentNumber,
    amendmentType: amendment.permit_amendment_type_code,
    isAmalgamated: amendment.permit_amendment_type_code === PERMIT_AMENDMENT_TYPES.amalgamated,
    receivedDate: formatDate(amendment.received_date) || Strings.EMPTY_FIELD,
    issueDate: formatDate(amendment.issue_date) || Strings.EMPTY_FIELD,
    authorizationEndDate: formatDate(amendment.authorization_end_date) || Strings.EMPTY_FIELD,
    description: amendment.description || Strings.EMPTY_FIELD,
    isAssociatedWithNOWApplicationImportedToCore: "",
    operations: {
      major_mine_ind,
      amendment,
    },
    openEditAmendmentModal,
    permit: record.permit,
    documents: amendment.related_documents,
    handleDeletePermitAmendment,
    handlePermitAmendmentIssueVC,
    finalApplicationPackage: this.finalApplicationPackage(amendment),
    maps: amendment.now_application_documents?.filter(
      (doc) => doc.now_application_document_sub_type_code === "MDO"
    ),
    permitAmendmentTypeOptionsHash,
  });

  RenderPermitTableExpandIcon = (rowProps) => (
    <a
      role="link"
      className="expand-row-icon"
      onClick={(e) => rowProps.onExpand(rowProps.record, e)}
      onKeyPress={(e) => rowProps.onExpand(rowProps.record, e)}
      style={{ cursor: "pointer" }}
      tabIndex="0"
    >
      {rowProps.expanded ? (
        <Tooltip title="Click to hide amendment history." placement="right" mouseEnterDelay={1}>
          <MinusSquareFilled className="icon-lg--lightgrey" />
        </Tooltip>
      ) : (
        <Tooltip title="Click to view amendment history." placement="right" mouseEnterDelay={1}>
          <PlusSquareFilled className="icon-lg--lightgrey" />
        </Tooltip>
      )}
    </a>
  );

  amendmentHistory = (permit) => {
    const childRowData = permit?.permit_amendments?.map((amendment, index) =>
      this.transformChildRowData(
        amendment,
        permit,
        permit.permit_amendments.length - index,
        this.props.major_mine_ind,
        this.props.openEditAmendmentModal,
        this.props.handleDeletePermitAmendment,
        this.props.handlePermitAmendmentIssueVC,
        this.props.permitAmendmentTypeOptionsHash
      )
    );

    return (
      <Table
        align="left"
        pagination={false}
        columns={this.childColumns}
        dataSource={childRowData}
      />
    );
  };

  rowData = this.props.permits?.map((permit) =>
    this.transformRowData(
      permit,
      this.props.partyRelationships,
      this.props.major_mine_ind,
      this.props.openEditPermitModal,
      this.props.openAddPermitAmendmentModal,
      this.props.openAddAmalgamatedPermitModal,
      this.props.permitStatusOptionsHash,
      this.props.handleDeletePermit,
      this.props.handleDeletePermitAmendment,
      this.props.openAddPermitHistoricalAmendmentModal,
      this.props.openEditSitePropertiesModal
    )
  );

  render() {
    return (
      <CoreTable
        condition={this.props.isLoaded}
        dataSource={this.rowData}
        columns={this.columns}
        tableProps={{
          className: "nested-table",
          rowClassName: "table-row-align-middle pointer fade-in",
          align: "left",
          pagination: false,
          expandIcon: this.RenderPermitTableExpandIcon,
          expandRowByClick: true,
          expandedRowRender: this.amendmentHistory,
          expandedRowKeys: this.props.expandedRowKeys,
          onExpand: this.props.onExpand,
        }}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  partyRelationships: getPartyRelationships(state),
  permitStatusOptionsHash: getDropdownPermitStatusOptionsHash(state),
  permitAmendmentTypeOptionsHash: getPermitAmendmentTypeOptionsHash(state),
});

MinePermitTable.propTypes = propTypes;
MinePermitTable.defaultProps = defaultProps;

export default connect(mapStateToProps)(MinePermitTable);

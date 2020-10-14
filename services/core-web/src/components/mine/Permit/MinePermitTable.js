import React from "react";
import { Table, Menu, Dropdown, Button, Tooltip, Popconfirm } from "antd";
import { MinusSquareFilled, PlusOutlined, PlusSquareFilled } from "@ant-design/icons";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { formatDate } from "@common/utils/helpers";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import { getDropdownPermitStatusOptionsHash } from "@common/selectors/staticContentSelectors";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_OUTLINE, EDIT_OUTLINE_VIOLET, EDIT, CARAT, TRASHCAN } from "@/constants/assets";
import LinkButton from "@/components/common/LinkButton";
import CoreTable from "@/components/common/CoreTable";

/**
 * @class  MinePermitTable - displays a table of permits and permit amendments
 */

const amalgamatedPermit = "ALG";
const originalPermit = "OGP";

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
  handleAddPermitAmendmentApplication: PropTypes.func.isRequired,
  handleDeletePermit: PropTypes.func.isRequired,
  handleDeletePermitAmendment: PropTypes.func.isRequired,
};

const defaultProps = {
  partyRelationships: [],
};

const renderDocumentLink = (file, text) => (
  <LinkButton key={file.mine_document_guid} onClick={() => downloadFileFromDocumentManager(file)}>
    {text}
  </LinkButton>
);

const renderDeleteButtonForPermitAmendments = (record) => {
  if (record.amendmentType === originalPermit) {
    return;
  }

  // eslint-disable-next-line consistent-return
  return (
    <AuthorizationWrapper permission={Permission.ADMIN}>
      <Popconfirm
        placement="topLeft"
        title="Are you sure you want to delete this amendment and all related documents?"
        okText="Delete"
        cancelText="Cancel"
        onConfirm={() => record.handleDeletePermitAmendment(record)}
      >
        <Button className="permit-table-button" type="ghost">
          <div>
            <img
              className="padding-small--right icon-svg-filter"
              src={TRASHCAN}
              alt="Remove Permit Amendment"
            />
          </div>
        </Button>
      </Popconfirm>
    </AuthorizationWrapper>
  );
};

const renderPermitNo = (permit) => {
  const permitNoShouldLinkToDocument =
    permit.permit_amendments[0] &&
    permit.permit_amendments[0].permit_amendment_type_code === amalgamatedPermit &&
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
    title: "Authorization End Date",
    dataIndex: "authorizationEndDate",
    key: "authorizationEndDate",
    render: (text) => <div title="Authorization End Date">{text}</div>,
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
                <PlusOutlined className="padding-small add-permit-dropdown-button-icon" />
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
                  <PlusOutlined className="padding-small add-permit-dropdown-button-icon" />
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
                  <PlusOutlined className="padding-small add-permit-dropdown-button-icon" />
                  Add Permit Historical Amendment
                </div>
              </button>
            </div>
          </AuthorizationWrapper>
          <Menu.Item key="2">
            <button
              type="button"
              className="full"
              onClick={(event) =>
                record.openEditPermitModal(event, record.permit, record.description)
              }
            >
              <img
                alt="document"
                className="padding-small"
                src={EDIT_OUTLINE_VIOLET}
                style={{ paddingRight: "15px" }}
              />
              Edit Permit Status
            </button>
          </Menu.Item>
          <div className="custom-menu-item" key="3">
            <button
              type="button"
              className="full"
              onClick={() => {
                record.handleAddPermitAmendmentApplication(record.key);
              }}
            >
              <img
                alt="document"
                className="padding-small"
                src={EDIT_OUTLINE_VIOLET}
                style={{ paddingRight: "15px" }}
              />
              Initiate Permit Amendment Application
            </button>
          </div>
        </Menu>
      );

      const deletePermitPopUp = (
        <Popconfirm
          placement="topLeft"
          {...(() => {
            return record.permit.bonds && record.permit.bonds.length > 0
              ? {
                  title: "You cannot delete a permit that has associated bond records.",
                  okText: "Ok",
                }
              : {
                  title:
                    "Are you sure you want to delete this permit and all related permit amendments and permit documents?",
                  onConfirm: () => record.handleDeletePermit(record.permit.permit_guid),
                  okText: "Delete",
                  cancelText: "Cancel",
                };
          })()}
        >
          <Button ghost type="primary" size="small">
            <img name="remove" src={TRASHCAN} alt="Remove Permit" />
          </Button>
        </Popconfirm>
      );
      return (
        <div className="btn--middle flex">
          <AuthorizationWrapper
            permission={Permission.EDIT_PERMITS}
            isMajorMine={text.major_mine_ind}
          >
            <Dropdown className="full-height full-mobile" overlay={menu} placement="bottomLeft">
              <Button type="secondary" className="permit-table-button">
                <div className="padding-small">
                  <img className="padding-small--right icon-svg-filter" src={EDIT} alt="Add/Edit" />
                  Add/Edit
                  <img
                    className="padding-small--right icon-svg-filter"
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

const childColumns = [
  {
    title: "Amendment",
    dataIndex: "amendmentNumber",
    key: "amendmentNumber",
    width: "130px",
    render: (text) => <div title="Amendment">{text}</div>,
  },
  {
    title: "Date Issued",
    dataIndex: "issueDate",
    key: "issueDate",
    width: "90px",
    render: (text) => <div title="Issue Date">{text}</div>,
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
    title: "Files",
    dataIndex: "documents",
    key: "documents",
    render: (text, record) => (
      <div title="Files">
        <ul>
          {text.map((file) => (
            <li className="wrapped-text">
              {record.isAmalgamated ? (
                <>
                  {renderDocumentLink(file, file.document_name)}
                  <span> (amalgamated)</span>
                </>
              ) : (
                renderDocumentLink(file, file.document_name)
              )}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "amendmentEdit",
    key: "amendmentEdit",
    align: "right",
    render: (text, record) => (
      <div>
        <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
          <Button
            className="permit-table-button"
            type="ghost"
            onClick={(event) => record.openEditAmendmentModal(event, text.amendment, record.permit)}
          >
            <div>
              <img className="padding-small--right icon-svg-filter" src={EDIT_OUTLINE} alt="Edit" />
            </div>
          </Button>
        </AuthorizationWrapper>
        {renderDeleteButtonForPermitAmendments(record)}
      </div>
    ),
  },
];

const transformRowData = (
  permit,
  partyRelationships,
  major_mine_ind,
  openEditPermitModal,
  openAddPermitAmendmentModal,
  openAddAmalgamatedPermitModal,
  handleAddPermitAmendmentApplication,
  permitStatusOptionsHash,
  handleDeletePermit,
  handleDeletePermitAmendment,
  openAddPermitHistoricalAmendmentModal
) => {
  const latestAmendment = permit.permit_amendments[0];
  const firstAmendment = permit.permit_amendments[permit.permit_amendments.length - 1];

  const hasAmalgamated = permit.permit_amendments.find(
    (pa) => pa.permit_amendment_type_code === amalgamatedPermit
  );

  return {
    key: permit.permit_guid,
    lastAmended: (latestAmendment && formatDate(latestAmendment.issue_date)) || Strings.EMPTY_FIELD,
    permitNo: permit.permit_no || Strings.EMPTY_FIELD,
    firstIssued: (firstAmendment && formatDate(firstAmendment.issue_date)) || Strings.EMPTY_FIELD,
    permittee: permit.current_permittee,
    authorizationEndDate:
      (latestAmendment && formatDate(latestAmendment.authorization_end_date)) ||
      Strings.EMPTY_FIELD,
    permit_amendments: permit.permit_amendments,
    status: permit.permit_status_code,
    addEditButton: {
      major_mine_ind,
      hasAmalgamated,
    },
    openEditPermitModal,
    openAddPermitAmendmentModal,
    openAddAmalgamatedPermitModal,
    handleAddPermitAmendmentApplication,
    permitStatusOptionsHash,
    permit,
    handleDeletePermit,
    handleDeletePermitAmendment,
    openAddPermitHistoricalAmendmentModal,
  };
};

const transformChildRowData = (
  amendment,
  record,
  amendmentNumber,
  major_mine_ind,
  openEditAmendmentModal,
  handleDeletePermitAmendment
) => ({
  amendmentNumber,
  amendmentType: amendment.permit_amendment_type_code,
  isAmalgamated: amendment.permit_amendment_type_code === amalgamatedPermit,
  receivedDate: formatDate(amendment.received_date) || Strings.EMPTY_FIELD,
  issueDate: formatDate(amendment.issue_date) || Strings.EMPTY_FIELD,
  authorizationEndDate: formatDate(amendment.authorization_end_date) || Strings.EMPTY_FIELD,
  description: amendment.description || Strings.EMPTY_FIELD,
  amendmentEdit: {
    major_mine_ind,
    amendment,
  },
  openEditAmendmentModal,
  permit: record.permit,
  documents: amendment.related_documents,
  handleDeletePermitAmendment,
});

export const RenderPermitTableExpandIcon = (rowProps) => (
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
        <MinusSquareFilled className="icon-lg--grey" />
      </Tooltip>
    ) : (
      <Tooltip title="Click to view amendment history." placement="right" mouseEnterDelay={1}>
        <PlusSquareFilled className="icon-lg--grey" />
      </Tooltip>
    )}
  </a>
);

export const MinePermitTable = (props) => {
  const amendmentHistory = (permit) => {
    const childRowData = permit.permit_amendments.map((amendment, index) =>
      transformChildRowData(
        amendment,
        permit,
        permit.permit_amendments.length - index,
        props.major_mine_ind,
        props.openEditAmendmentModal,
        props.handleDeletePermitAmendment
      )
    );
    return (
      <Table align="left" pagination={false} columns={childColumns} dataSource={childRowData} />
    );
  };

  const rowData = props.permits.map((permit) =>
    transformRowData(
      permit,
      props.partyRelationships,
      props.major_mine_ind,
      props.openEditPermitModal,
      props.openAddPermitAmendmentModal,
      props.openAddAmalgamatedPermitModal,
      props.handleAddPermitAmendmentApplication,
      props.permitStatusOptionsHash,
      props.handleDeletePermit,
      props.handleDeletePermitAmendment,
      props.openAddPermitHistoricalAmendmentModal
    )
  );

  return (
    <CoreTable
      condition={props.isLoaded}
      dataSource={rowData}
      columns={columns}
      tableProps={{
        className: "nested-table",
        rowClassName: "table-row-align-middle pointer fade-in",
        align: "left",
        pagination: false,
        expandIcon: RenderPermitTableExpandIcon,
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
});

MinePermitTable.propTypes = propTypes;
MinePermitTable.defaultProps = defaultProps;

export default connect(mapStateToProps)(MinePermitTable);

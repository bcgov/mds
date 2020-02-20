import React from "react";
import { Table, Menu, Dropdown, Button, Icon, Tooltip } from "antd";
import moment from "moment";
import { orderBy } from "lodash";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { formatDate } from "@common/utils/helpers";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import { getDropdownPermitStatusOptions } from "@common/selectors/staticContentSelectors";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_OUTLINE, EDIT_OUTLINE_VIOLET, EDIT, CARAT } from "@/constants/assets";
import LinkButton from "@/components/common/LinkButton";
import CoreTable from "@/components/common/CoreTable";

/**
 * @class  MinePermitTable - displays a table of permits and permit amendments
 */

const amalgamatedPermit = "ALG";

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  major_mine_ind: PropTypes.bool.isRequired,
  openEditPermitModal: PropTypes.func.isRequired,
  openAddPermitAmendmentModal: PropTypes.func.isRequired,
  openAddAmalgamatedPermitModal: PropTypes.func.isRequired,
  // This prop is used. Linting issue is unclear
  openEditAmendmentModal: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  expandedRowKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  onExpand: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  handleAddPermitAmendmentApplication: PropTypes.func.isRequired,
};

const defaultProps = {
  partyRelationships: [],
};

const renderDocumentLink = (file, text) => (
  <LinkButton key={file.mine_document_guid} onClick={() => downloadFileFromDocumentManager(file)}>
    {text}
  </LinkButton>
);

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
    render: (text, record) => (
      <div title="Status">
        {record.permitStatusOptions.find((item) => item.value === text).label}
      </div>
    ),
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
                <Icon
                  type="plus"
                  className="padding-small add-permit-dropdown-button-icon"
                  theme="outlined"
                />
                {text.hasAmalgamated ? "Add permit amendment" : "Amalgamate permit"}
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
                  <Icon
                    type="plus"
                    className="padding-small add-permit-dropdown-button-icon"
                    theme="outlined"
                  />
                  Add permit amendment
                </div>
              </button>
            </Menu.Item>
          )}
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
              Edit permit status
            </button>
          </Menu.Item>{" "}
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
      return (
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
    render: (text) => (
      <div title="Files">
        <ul>
          {text.map((file) => (
            <li className="wrapped-text">{renderDocumentLink(file, file.document_name)}</li>
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
    ),
  },
];

const getPermittees = (partyRelationships, permit) =>
  orderBy(
    partyRelationships.filter(({ related_guid }) => permit.permit_guid === related_guid),
    (o) => (o.end_date && new Date(o.end_date).getTime()) || Infinity,
    ["desc"]
  );

// Since end date is stored at yyyy-mm-dd, comparing current Date() to
// the the start of the next day ensures appointments ending today are displayed.
const isActive = (permittee) =>
  (!permittee.end_date || moment(permittee.end_date).add(1, "days") > new Date()) &&
  (!permittee.start_date || Date.parse(permittee.start_date) <= new Date());

const getPermitteeName = (permittees) => {
  const activePermittee = permittees.filter(isActive);
  return activePermittee[0] ? activePermittee[0].party.name : Strings.EMPTY_FIELD;
};

const transformRowData = (
  permit,
  partyRelationships,
  major_mine_ind,
  openEditPermitModal,
  openAddPermitAmendmentModal,
  openAddAmalgamatedPermitModal,
  handleAddPermitAmendmentApplication,
  permitStatusOptions
) => {
  const latestAmendment = permit.permit_amendments[0];
  const firstAmendment = permit.permit_amendments[permit.permit_amendments.length - 1];

  const permittees = getPermittees(partyRelationships, permit);
  const permitteeName = partyRelationships.length === 0 ? "" : getPermitteeName(permittees);
  const hasAmalgamated = permit.permit_amendments.find(
    (pa) => pa.permit_amendment_type_code === amalgamatedPermit
  );

  return {
    key: permit.permit_guid,
    lastAmended: (latestAmendment && formatDate(latestAmendment.issue_date)) || Strings.EMPTY_FIELD,
    permitNo: permit.permit_no || Strings.EMPTY_FIELD,
    firstIssued: (firstAmendment && formatDate(firstAmendment.issue_date)) || Strings.EMPTY_FIELD,
    permittee: permitteeName,
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
    permitStatusOptions,
    permit,
  };
};

const transformChildRowData = (
  amendment,
  record,
  amendmentNumber,
  major_mine_ind,
  openEditAmendmentModal
) => ({
  amendmentNumber,
  amendmentType: amendment.permit_amendment_type_code,
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
        <Icon type="minus-square" theme="filled" className="icon-lg--grey" />
      </Tooltip>
    ) : (
      <Tooltip title="Click to view amendment history." placement="right" mouseEnterDelay={1}>
        <Icon type="plus-square" theme="filled" className="icon-lg--grey" />
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
        props.openEditAmendmentModal
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
      props.permitStatusOptions
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
        locale: { emptyText: <NullScreen type="permit" /> },
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
  permitStatusOptions: getDropdownPermitStatusOptions(state),
});

MinePermitTable.propTypes = propTypes;
MinePermitTable.defaultProps = defaultProps;

export default connect(mapStateToProps)(MinePermitTable);

import React from "react";
import { Table, Menu, Dropdown, Button, Icon } from "antd";
import NullScreen from "@/components/common/NullScreen";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Strings from "@/constants/strings";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { formatDate } from "@/utils/helpers";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getPartyRelationships } from "@/selectors/partiesSelectors";
import { getDropdownPermitStatusOptions } from "@/selectors/staticContentSelectors";
import { BRAND_PENCIL, EDIT, EDIT_OUTLINE, CARAT } from "@/constants/assets";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";

/**
 * @class  MinePermitTable - displays a table of permits and permit amendments
 */

const amalgamtedPermit = "ALG";

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  major_mine_ind: PropTypes.bool.isRequired,
  openEditPermitModal: PropTypes.func.isRequired,
  openEditAmendmentModal: PropTypes.func.isRequired,
  openAddPermitAmendmentModal: PropTypes.func.isRequired,
  openAddAmalgamatedPermitModal: PropTypes.func.isRequired,
};

const defaultProps = {
  partyRelationships: [],
};

const columns = [
  {
    title: "Permit No.",
    dataIndex: "permitNo",
    key: "permitNo",
    render: (text) => <div title="Permit No.">{text}</div>,
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
                {text.hasAmalgamated ? "Add permit amendment" : "Add amalgamated permit"}
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
                src={BRAND_PENCIL}
                style={{ paddingRight: "15px" }}
              />
              Edit permit status
            </button>
          </Menu.Item>
        </Menu>
      );
      return (
        <AuthorizationWrapper inTesting>
          <AuthorizationWrapper permission={Permission.CREATE} isMajorMine={text.major_mine_ind}>
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
    render: (text) => <div title="Amendment">{text}</div>,
  },
  {
    title: "Date Issued",
    dataIndex: "issueDate",
    key: "issueDate",
    render: (text) => <div title="Issue Date">{text}</div>,
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    render: (text) => <div title="Description">{text}</div>,
  },
  {
    title: "Files",
    dataIndex: "documents",
    key: "documents",
    render: (text) => (
      <div>
        <ul>
          {text.map((file) => (
            <li>
              <a
                key={file.mine_document_guid}
                onClick={() =>
                  downloadFileFromDocumentManager(file.document_manager_guid, file.document_name)
                }
              >
                {file.document_name}
              </a>
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
      <AuthorizationWrapper inTesting>
        <AuthorizationWrapper permission={Permission.CREATE} isMajorMine={text.major_mine_ind}>
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
      </AuthorizationWrapper>
    ),
  },
];

const getPermittees = (partyRelationships, permit) =>
  partyRelationships
    .filter(({ related_guid }) => permit.permit_guid === related_guid)
    .sort((order1, order2) => {
      const date1 = Date.parse(order1.due_date) || 0;
      const date2 = Date.parse(order2.due_date) || 0;
      return date1 === date2 ? order1.order_no - order2.order_no : date1 - date2;
    });

const getPermitteeName = (permittees) =>
  permittees[0] ? permittees[0].party.party_name : Strings.EMPTY_FIELD;

const transformRowData = (
  permit,
  partyRelationships,
  major_mine_ind,
  openEditPermitModal,
  openAddPermitAmendmentModal,
  openAddAmalgamatedPermitModal,
  permitStatusOptions
) => {
  const latestAmendment = permit.amendments[0];
  const firstAmendment = permit.amendments[permit.amendments.length - 1];

  const permittees = getPermittees(partyRelationships, permit);
  const permitteeName = partyRelationships.length === 0 ? "" : getPermitteeName(permittees);
  const hasAmalgamated = permit.amendments.find(
    (pa) => pa.permit_amendment_type_code === amalgamtedPermit
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
    amendments: permit.amendments,
    status: permit.permit_status_code,
    addEditButton: {
      major_mine_ind,
      hasAmalgamated,
    },
    openEditPermitModal,
    openAddPermitAmendmentModal,
    openAddAmalgamatedPermitModal,
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

export const MinePermitTable = (props) => {
  const amendmentHistory = (permit) => {
    const childRowData = permit.amendments.map((amendment, index) =>
      transformChildRowData(
        amendment,
        permit,
        permit.amendments.length - index,
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
      props.permitStatusOptions
    )
  );

  return (
    <Table
      className="nested-table"
      rowClassName={() => "table-row-align-middle"}
      align="left"
      pagination={false}
      columns={columns}
      dataSource={rowData}
      expandedRowRender={amendmentHistory}
      locale={{ emptyText: <NullScreen type="permit" /> }}
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

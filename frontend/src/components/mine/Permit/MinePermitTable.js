import React from "react";
import { bindActionCreators } from "redux";
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
import { BRAND_PENCIL, EDIT, EDITOUTLINE, CARAT } from "@/constants/assets";
import { modalConfig } from "@/components/modalContent/config";
import {
  updatePermitAmendment,
  createPermitAmendment,
  updatePermit,
} from "@/actionCreators/permitActionCreator";
/**
 * @class  MinePermitTable - displays a table of permits and permit amendments
 */

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  major_mine_ind: PropTypes.bool.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  updatePermitAmendment: PropTypes.func.isRequired,
  createPermitAmendment: PropTypes.func.isRequired,
  updatePermit: PropTypes.func.isRequired,
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
    render: (text) => <div title="Status">{text === "O" ? "Open" : "Closed"}</div>,
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
              onClick={(event) =>
                record.openAddAmalgamatedPermitModal(event, text.guid, text.permit_no)
              }
            >
              <div>
                <Icon
                  type="plus"
                  className="padding-small add-permit-dropdown-button-icon"
                  theme="outlined"
                />
                {text.hasAmalgamated ? "Update amalgamated permit" : "Add amalgamated permit"}
              </div>
            </button>
          </Menu.Item>
          <Menu.Item key="1">
            <button
              type="button"
              className="full add-permit-dropdown-button"
              onClick={(event) =>
                record.openAddPermitAmendmentModal(event, text.guid, text.permit_no)
              }
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
          <Menu.Item key="2">
            <button
              type="button"
              className="full"
              onClick={(event) =>
                record.openEditPermitModal(event, text.guid, text.permit_no, record.description)
              }
            >
              <img alt="document" className="padding-small" src={BRAND_PENCIL} />
              &nbsp;&nbsp;&nbsp;Edit permit status
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
                  Add/Edit&nbsp;&nbsp;
                  <img className="padding-small--right icon-svg-filter" src={CARAT} alt="Menu" />
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
            onClick={(event) =>
              record.openEditAmendmentModal(
                event,
                text.guid,
                text.permit_guid,
                text.permit_no,
                text.description
              )
            }
          >
            <div>
              <img className="padding-small--right icon-svg-filter" src={EDITOUTLINE} alt="Edit" />
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
  openAddAmalgamatedPermitModal
) => {
  const latestAmendment = permit.amendments[0];
  const firstAmendment = permit.amendments[permit.amendments.length - 1];

  const permittees = getPermittees(partyRelationships, permit);
  const permitteeName = partyRelationships.length === 0 ? "" : getPermitteeName(permittees);
  const hasAmalgamated = permit.amendments.find((pa) => pa.permit_amendment_type_code === "ALG");

  return {
    key: permit.permit_guid,
    lastAmended:
      (latestAmendment && latestAmendment.issue_date && formatDate(latestAmendment.issue_date)) ||
      Strings.EMPTY_FIELD,
    permitNo: permit.permit_no || Strings.EMPTY_FIELD,
    firstIssued:
      (firstAmendment && firstAmendment.issue_date && formatDate(firstAmendment.issue_date)) ||
      Strings.EMPTY_FIELD,
    permittee: permitteeName,
    authorizationEndDate:
      latestAmendment && latestAmendment.authorization_end_date
        ? formatDate(latestAmendment.authorization_end_date)
        : Strings.EMPTY_FIELD,
    amendments: permit.amendments,
    status: permit.permit_status_code,
    addEditButton: {
      guid: permit.permit_guid,
      major_mine_ind,
      hasAmalgamated,
      permit_no: permit.permit_no,
    },
    openEditPermitModal,
    openAddPermitAmendmentModal,
    openAddAmalgamatedPermitModal,
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
  receivedDate:
    (amendment.received_date && formatDate(amendment.received_date)) || Strings.EMPTY_FIELD,
  issueDate: (amendment.issue_date && formatDate(amendment.issue_date)) || Strings.EMPTY_FIELD,
  authorizationEndDate:
    (amendment.authorization_end_date && formatDate(amendment.authorization_end_date)) ||
    Strings.EMPTY_FIELD,
  description: amendment.description || Strings.EMPTY_FIELD,
  amendmentEdit: {
    guid: amendment.permit_amendment_guid,
    permit_guid: amendment.permit_guid,
    major_mine_ind,
    description: amendment.description,
  },
  openEditAmendmentModal,
});

export const MinePermitTable = (props) => {
  // Edit permit Amendment
  const handleEditPermitAmendment = (data) => {
    props.updatePermitAmendment(data.permit_amendment_guid, data).then(() => {
      props.closeModal();
    });
  };

  const openEditAmendmentModal = (
    event,
    permit_amendment_guid,
    permit_guid,
    permit_no,
    description
  ) => {
    const permit = props.permits.find((p) => p.permit_guid === permit_guid);
    const permit_amendment = permit.amendments.find(
      (pa) => pa.permit_amendment_guid === permit_amendment_guid
    );

    const initialValues = {
      issue_date: permit_amendment.issue_date,
      permit_amendment_guid,
      description,
    };

    event.preventDefault();
    props.openModal({
      props: {
        initialValues,
        onSubmit: handleEditPermitAmendment,
        title: `Edit permit amendment for ${permit.permit_no}`,
      },
      content: modalConfig.ADD_PERMIT_AMENDMENT,
    });
  };

  // Add Permit Amendment
  const handleAddPermitAmendment = (data) => {
    props.createPermitAmendment(data.permit_guid, data).then(() => {
      props.closeModal();
    });
  };
  // Edit Permit
  const handleEditPermit = (data) => {
    props.updatePermit(data.permit_guid, data).then(() => {
      props.closeModal();
    });
  };

  // Add amalgamated Permit Amendment
  const handleAddAlgPermitAmendment = (data) => {
    const alg_data = { ...data, permit_amendment_type_code: "ALG" };
    props.createPermitAmendment(data.permit_guid, alg_data).then(() => {
      props.closeModal();
    });
  };

  const openAddAmendmentModal = (event, onSubmit, title, permit_guid) => {
    event.preventDefault();
    props.openModal({
      props: {
        initialValues: { permit_guid },
        onSubmit,
        title,
      },
      content: modalConfig.ADD_PERMIT_AMENDMENT,
    });
  };

  const openEditPermitModal = (event, permit_guid, permit_no) => {
    const permit = props.permits.find((p) => p.permit_guid === permit_guid);

    const initialValues = {
      permit_status_code: permit.permit_status_code,
      permit_guid,
    };
    event.preventDefault();
    props.openModal({
      props: {
        initialValues,
        onSubmit: handleEditPermit,
        title: `Edit permit status for ${permit_no}`,
      },
      content: modalConfig.EDIT_PERMIT,
    });
  };

  const openAddAmalgamatedPermitModal = (event, permit_guid, permit_no) =>
    openAddAmendmentModal(
      event,
      handleAddAlgPermitAmendment,
      `Add amalgamated permit to ${permit_no}`,
      permit_guid
    );

  const openAddPermitAmendmentModal = (event, permit_guid, permit_no) =>
    openAddAmendmentModal(
      event,
      handleAddPermitAmendment,
      `Add permit amendment to ${permit_no}`,
      permit_guid
    );

  const amendmentHistory = (record) => {
    const childRowData = record.amendments.map((amendment, index) =>
      transformChildRowData(
        amendment,
        record,
        record.amendments.length - index,
        props.major_mine_ind,
        openEditAmendmentModal
      )
    );
    return (
      <Table
        rowClassName={() => "permit-table-row"}
        align="left"
        pagination={false}
        columns={childColumns}
        dataSource={childRowData}
      />
    );
  };

  const rowData = props.permits.map((permit) =>
    transformRowData(
      permit,
      props.partyRelationships,
      props.major_mine_ind,
      openEditPermitModal,
      openAddPermitAmendmentModal,
      openAddAmalgamatedPermitModal
    )
  );

  return (
    <Table
      className="nested-table"
      rowClassName={() => "permit-table-row"}
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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updatePermitAmendment,
      createPermitAmendment,
      updatePermit,
    },
    dispatch
  );

MinePermitTable.propTypes = propTypes;
MinePermitTable.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MinePermitTable);

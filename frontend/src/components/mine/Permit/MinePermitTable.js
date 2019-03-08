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
import { getDropdownPermitStatusOptions } from "@/selectors/staticContentSelectors";
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
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
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
            onClick={(event) => record.openEditAmendmentModal(event, text.amendment, record.permit)}
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
  openAddAmalgamatedPermitModal,
  permitStatusOptions
) => {
  const latestAmendment = permit.amendments[0];
  const firstAmendment = permit.amendments[permit.amendments.length - 1];

  const permittees = getPermittees(partyRelationships, permit);
  const permitteeName = partyRelationships.length === 0 ? "" : getPermitteeName(permittees);
  const hasAmalgamated = permit.amendments.find((pa) => pa.permit_amendment_type_code === "ALG");

  return {
    key: permit.permit_guid,
    lastAmended: formatDate(latestAmendment.issue_date),
    permitNo: permit.permit_no || Strings.EMPTY_FIELD,
    firstIssued: formatDate(firstAmendment.issue_date),
    permittee: permitteeName,
    authorizationEndDate: formatDate(latestAmendment.authorization_end_date),
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
  receivedDate:
    (amendment.received_date && formatDate(amendment.received_date)) || Strings.EMPTY_FIELD,
  issueDate: (amendment.issue_date && formatDate(amendment.issue_date)) || Strings.EMPTY_FIELD,
  authorizationEndDate:
    (amendment.authorization_end_date && formatDate(amendment.authorization_end_date)) ||
    Strings.EMPTY_FIELD,
  description: amendment.description || Strings.EMPTY_FIELD,
  amendmentEdit: {
    major_mine_ind,
    amendment,
  },
  openEditAmendmentModal,
  permit: record.permit,
});

export const MinePermitTable = (props) => {
  // Edit permit Amendment
  const handleEditPermitAmendment = (data) => {
    props.updatePermitAmendment(data.permit_amendment_guid, data).then(() => {
      props.closeModal();
    });
  };

  const openEditAmendmentModal = (event, permit_amendment, permit) => {
    const initialValues = {
      ...permit_amendment,
    };
    console.log(permit);
    event.preventDefault();
    props.openModal({
      props: {
        initialValues,
        onSubmit: handleEditPermitAmendment,
        title: `Edit permit amendment for ${permit.permit_no}`,
        mine_guid: permit.mine_guid,
      },
      content: modalConfig.PERMIT_AMENDMENT,
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

  const openAddAmendmentModal = (event, onSubmit, title, permit) => {
    event.preventDefault();
    props.openModal({
      props: {
        permit,
        onSubmit,
        title,
        mine_guid: permit.mine_guid,
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

  const openAddAmalgamatedPermitModal = (event, permit) =>
    openAddAmendmentModal(
      event,
      handleAddAlgPermitAmendment,
      `Add amalgamated permit to ${permit.permit_no}`,
      permit
    );

  const openAddPermitAmendmentModal = (event, permit) =>
    openAddAmendmentModal(
      event,
      handleAddPermitAmendment,
      `Add permit amendment to ${permit.permit_no}`,
      permit
    );

  const amendmentHistory = (permit) => {
    const childRowData = permit.amendments.map((amendment, index) =>
      transformChildRowData(
        amendment,
        permit,
        permit.amendments.length - index,
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
      openAddAmalgamatedPermitModal,
      props.permitStatusOptions
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
  permitStatusOptions: getDropdownPermitStatusOptions(state),
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

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
import { BRAND_PENCIL, EDIT } from "@/constants/assets";
import { modalConfig } from "@/components/modalContent/config";
import { updatePermitAmendment, createPermitAmendment } from "@/actionCreators/permitActionCreator";
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
    render: (text) => <div title="Status">{text}</div>,
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
    render: (text, record) => {
      const menu = (
        <Menu>
          <Menu.Item key="0">
            <button type="button" className="full">
              <Icon type="plus-circle" theme="outlined" style={{ fontSize: "16px" }} />
              Add amalgamated permit
            </button>
          </Menu.Item>
          <Menu.Item key="1">
            <button
              type="button"
              className="full"
              onClick={(event) => record.openAddAmendmentModal(event, text.guid)}
            >
              <Icon type="plus-circle" theme="outlined" style={{ fontSize: "16px" }} />
              Add permit amendment
            </button>
          </Menu.Item>
          <Menu.Item key="2">
            <button type="button" className="full">
              <img alt="document" className="padding-small" src={BRAND_PENCIL} />
              Edit permit
            </button>
          </Menu.Item>
        </Menu>
      );
      return (
        <AuthorizationWrapper permission={Permission.CREATE} isMajorMine={text.major_mine_ind}>
          <Dropdown className="full-height full-mobile" overlay={menu} placement="bottomLeft">
            <Button type="primary">
              <div className="padding-small">
                <img className="padding-small--right" src={EDIT} alt="Add/Edit" />
                Add/Edit
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
    render: (text) => <div title="Amendment">{text}</div>,
  },
  {
    title: "Received Date",
    dataIndex: "receivedDate",
    key: "receivedDate",
    render: (text) => <div title="Received Date">{text}</div>,
  },
  {
    title: "Issue Date",
    dataIndex: "issueDate",
    key: "issueDate",
    render: (text) => <div title="Issue Date">{text}</div>,
  },
  {
    title: "Authorization End Date",
    dataIndex: "authorizationEndDate",
    key: "authorizationEndDate",
    render: (text) => <div title="Authorization End Date">{text}</div>,
  },
  {
    title: "",
    dataIndex: "amendmentGuid",
    key: "amendmentGuid",
    render: (text, record) => (
      <div>
        {text.major_mine_ind && (
          <Button
            type="primary"
            onClick={(event) => record.openEditAmendmentModal(event, text.guid, text.permit_guid)}
          >
            <div className="padding-small">
              <img className="padding-small--right" src={EDIT} alt="Edit" />
              Edit
            </div>
          </Button>
        )}
      </div>
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

const transformRowData = (permit, partyRelationships, major_mine_ind, openAddAmendmentModal) => {
  const latestAmendment = permit.amendments[0];
  const firstAmendment = permit.amendments[permit.amendments.length - 1];

  const permittees = getPermittees(partyRelationships, permit);
  const permitteeName =
    partyRelationships.length === 0 ? Strings.LOADING : getPermitteeName(permittees);

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
    addEditButton: { guid: permit.permit_guid, major_mine_ind },
    openAddAmendmentModal,
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
  description: Strings.EMPTY_FIELD,
  amendmentGuid: {
    guid: amendment.permit_amendment_guid,
    permit_guid: amendment.permit_guid,
    major_mine_ind,
  },
  openEditAmendmentModal,
});

export const MinePermitTable = (props) => {
  const handleEditPermitAmendment = (data, permit_amendment_guid) => {
    const result = { permit_amendment_guid, ...data };

    props.updatePermitAmendment(result).then(() => {
      props.closeModal();
    });
  };

  const openEditPermitAmendmentModal = (event, permit_amendment_guid, permit_guid) => {
    const permit = props.permits.find((p) => p.permit_guid === permit_guid);
    const permit_amendment = permit.amendments.find(
      (pa) => pa.permit_amendment_guid === permit_amendment_guid
    );

    const initialValues = {
      received_date: permit_amendment.received_date,
      issue_date: permit_amendment.issue_date,
      authorization_end_date: permit_amendment.authorization_end_date,
      permit_amendment_guid,
    };

    event.preventDefault();
    props.openModal({
      props: {
        initialValues,
        onSubmit: handleEditPermitAmendment,
        title: "Edit Permit Amendment",
      },
      content: modalConfig.ADD_PERMIT_AMENDMENT,
    });
  };

  const handleAddPermitAmendment = (data) => {
    props.createPermitAmendment(data).then(() => {
      props.closeModal();
    });
  };

  const openAddPermitAmendmentModal = (event) => {
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: handleAddPermitAmendment,
        title: "Add Permit Amendment",
      },
      content: modalConfig.ADD_PERMIT_AMENDMENT,
    });
  };

  const amendmentHistory = (record) => {
    const childRowData = record.amendments.map((amendment, index) =>
      transformChildRowData(
        amendment,
        record,
        record.amendments.length - index,
        props.major_mine_ind,
        openEditPermitAmendmentModal
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
      openAddPermitAmendmentModal
    )
  );

  return (
    <Table
      className="nested-table"
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
    },
    dispatch
  );

MinePermitTable.propTypes = propTypes;
MinePermitTable.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MinePermitTable);

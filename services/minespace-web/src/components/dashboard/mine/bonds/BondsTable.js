import React from "react";
import { connect } from "react-redux";
import { Table } from "antd";
import PropTypes from "prop-types";
import { dateSorter, formatMoney } from "@common/utils/helpers";
import {
  getBondTypeOptionsHash,
  getBondStatusOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { formatDate } from "@/utils/helpers";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  bonds: PropTypes.arrayOf(CustomPropTypes.bond).isRequired,
  bondTypeOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

export const BondsTable = (props) => {
  const columns = [
    {
      title: "Issue Date",
      dataIndex: "issue_date",
      key: "issue_date",
      sorter: dateSorter("issue_date"),
      render: (text) => <div title="Issue Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Payer",
      dataIndex: "payer_party_guid",
      key: "payer_party_guid",
      sorter: (a, b) => (a.payer.name > b.payer.name ? -1 : 1),
      render: (text, record) => <div title="Payer">{record.payer.name || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Type",
      dataIndex: "bond_type_code",
      key: "bond_type_code",
      sorter: (a, b) => (a.bond_type_code > b.bond_type_code ? -1 : 1),
      render: (text) => (
        <div title="Type">{props.bondTypeOptionsHash[text] || Strings.EMPTY_FIELD}</div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => (a.amount > b.amount ? -1 : 1),
      render: (text) => <div title="Amount">{formatMoney(text) || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Status",
      dataIndex: "bond_status_code",
      key: "bond_status_code",
      sorter: (a, b) => (a.bond_status_code > b.bond_status_code ? -1 : 1),
      render: (text) => (
        <div title="Status">{props.bondStatusOptionsHash[text] || Strings.EMPTY_FIELD}</div>
      ),
      defaultSortOrder: "descend",
    },
  ];

  return (
    <Table
      size="small"
      pagination={false}
      loading={!props.isLoaded}
      columns={columns}
      rowKey={(record) => record.bond_guid}
      locale={{ emptyText: "This mine has no bond data." }}
      dataSource={props.bonds}
    />
  );
};

const mapStateToProps = (state) => ({
  bondTypeOptionsHash: getBondTypeOptionsHash(state),
  bondStatusOptionsHash: getBondStatusOptionsHash(state),
});

BondsTable.propTypes = propTypes;

export default connect(mapStateToProps)(BondsTable);

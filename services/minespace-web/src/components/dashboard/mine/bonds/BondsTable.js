import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { dateSorter, nullableStringSorter, formatMoney } from "@common/utils/helpers";
import {
  getBondTypeOptionsHash,
  getBondStatusOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { formatDate } from "@/utils/helpers";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@/components/common/CoreTable";

const propTypes = {
  bonds: PropTypes.arrayOf(CustomPropTypes.bond).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  bondTypeOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

export const BondsTable = (props) => {
  const columns = [
    {
      title: "Permit No.",
      dataIndex: "permit_no",
      key: "permit_no",
      sorter: nullableStringSorter("permit_no"),
      render: (text) => <div title="Permit No.">{text || Strings.EMPTY_FIELD}</div>,
    },
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
      sorter: nullableStringSorter("payer.name"),
      render: (text, record) => <div title="Payer">{record.payer.name || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Type",
      dataIndex: "bond_type_code",
      key: "bond_type_code",
      sorter: nullableStringSorter("bond_type_code"),
      render: (text) => (
        <div title="Type">{props.bondTypeOptionsHash[text] || Strings.EMPTY_FIELD}</div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => (a.amount > b.amount ? 1 : -1),
      render: (text) => <div title="Amount">{formatMoney(text) || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Status",
      dataIndex: "bond_status_code",
      key: "bond_status_code",
      sorter: nullableStringSorter("bond_status_code"),
      render: (text) => (
        <div title="Status">{props.bondStatusOptionsHash[text] || Strings.EMPTY_FIELD}</div>
      ),
      defaultSortOrder: "descend",
    },
  ];

  const transformRowData = (bonds) =>
    bonds.map((bond) => ({
      ...bond,
      key: bond.bond_guid,
      amount: Number(bond.amount),
    }));

  return (
    <CoreTable
      loading={!props.isLoaded}
      columns={columns}
      rowKey={(record) => record.bond_guid}
      emptyText="This mine has no bond data."
      dataSource={transformRowData(props.bonds)}
    />
  );
};

const mapStateToProps = (state) => ({
  bondTypeOptionsHash: getBondTypeOptionsHash(state),
  bondStatusOptionsHash: getBondStatusOptionsHash(state),
});

BondsTable.propTypes = propTypes;

export default connect(mapStateToProps)(BondsTable);

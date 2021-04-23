import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Badge, Popconfirm } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  getVarianceStatusOptionsHash,
  getHSRCMComplianceCodesHash,
} from "@common/selectors/staticContentSelectors";
import { getInspectorsHash , getPartyRelationships } from "@common/selectors/partiesSelectors";
import { formatDate, truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";

import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { RED_CLOCK, EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import LinkButton from "@/components/common/LinkButton";
import * as router from "@/constants/routes";
import CoreTable from "@/components/common/CoreTable";

const propTypes = {
  PartyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
};

const defaultProps = {};
const riskHash = {
  LOW: "Low",
  SIG: "Significant",
  HIG: "High",
  EXT: "Extreme",
  NOD: "N/A (No Dam)",
};

const statusHash = {
  CAM: "Care and Maintenance",
  CLO: "Closed",
  OPT: "Operating",
};

const boolHash = {
  true: "Yes",
  false: "No",
  null: "N/A",
};

export class MineTailingsTable extends Component {
  transformRowData = (tailings) =>
    tailings.map((tailing) => ({
      key: tailing.mine_tailings_storage_facility_guid,
      eor_party: this.props.partyRelationships
        .filter(
          (pr) =>
            pr.related_guid === tailing.mine_tailings_storage_facility_guid &&
            pr.mine_party_appt_type_code === "EOR"
        )
        .sort((a, b) => Date.parse(a.start_date) < Date.parse(b.start_date))[0],
      tqp_party: this.props.partyRelationships
        .filter(
          (pr) =>
            pr.related_guid === tailing.mine_tailings_storage_facility_guid &&
            pr.mine_party_appt_type_code === "TQP"
        )
        .sort((a, b) => Date.parse(a.start_date) < Date.parse(b.start_date))[0],
      ...tailing,
    }));

  render() {
    const columns = [
      {
        title: "Name",
        dataIndex: "mine_tailings_storage_facility_name",
        render: (text) => <div title="Name">{text}</div>,
      },
      {
        title: "Operating Status",
        dataIndex: "operating_status",
        render: (text) => <div title="Operating Status">{statusHash[text] || "N/A"}</div>,
      },
      {
        title: "Risk Classification",
        dataIndex: "risk_classification",
        render: (text) => <div title="Risk Classification">{riskHash[text] || "N/A"}</div>,
      },
      {
        title: "Independent Tailings Review Board",
        dataIndex: "has_itrb",
        render: (text) => <div title="Independent Tailings Review Board">{boolHash[text]}</div>,
      },
      {
        title: "Engineer of Record",
        dataIndex: "eor_party",
        render: (text) => <div title="Engineer of Record">{text ? text.party.name : "N/A"}</div>,
      },
      {
        title: "TSF Qualified Person",
        dataIndex: "tqp_party",
        render: (text) => <div title="Engineer of Record">{text ? text.party.name : "N/A"}</div>,
      },
      {
        title: "Latitude",
        dataIndex: "latitude",
        render: (text) => <div title="Latitude">{text}</div>,
      },
      {
        title: "Longitude",
        dataIndex: "longitude",
        render: (text) => <div title="Longitude">{text}</div>,
      },
    ];

    return (
      <CoreTable
        condition={this.props.isLoaded}
        dataSource={this.transformRowData(this.props.tailings)}
        columns={columns}
        tableProps={{
          align: "center",
          pagination: false,
        }}
      />
    );
  }
}

MineTailingsTable.propTypes = propTypes;
MineTailingsTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  partyRelationships: getPartyRelationships(state),
});

export default connect(mapStateToProps)(MineTailingsTable);

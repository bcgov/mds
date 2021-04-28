import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getTSFOperatingStatusCodeOptionsHash,
  getConsequenceClassificationStatusCodeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@/components/common/CoreTable";
import { BOOLEAN_OPTIONS_HASH } from "@common/constants/strings";

const propTypes = {
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
  TSFOperatingStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  consequenceClassificationStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  tailings: PropTypes.arrayOf(PropTypes.any).isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {};

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
        dataIndex: "tsf_operating_status_code",
        render: (text) => (
          <div title="Operating Status">
            {this.props.TSFOperatingStatusCodeHash[text] || Strings.EMPTY_FIELD}
          </div>
        ),
      },
      {
        title: "Consequence Classification",
        dataIndex: "consequence_classification_status_code",
        render: (text) => (
          <div title="Consequence Classification">
            {this.props.consequenceClassificationStatusCodeHash[text] || Strings.EMPTY_FIELD}
          </div>
        ),
      },
      {
        title: "Independent Tailings Review Board",
        dataIndex: "has_itrb",
        render: (text) => (
          <div title="Independent Tailings Review Board">{BOOLEAN_OPTIONS_HASH[text]}</div>
        ),
      },
      {
        title: "Engineer of Record",
        dataIndex: "eor_party",
        render: (text) => (
          <div title="Engineer of Record">{text ? text.party.name : Strings.EMPTY_FIELD}</div>
        ),
      },
      {
        title: "Latitude",
        dataIndex: "latitude",
        render: (text) => <div title="Latitude">{text || Strings.EMPTY_FIELD}</div>,
      },
      {
        title: "Longitude",
        dataIndex: "longitude",
        render: (text) => <div title="Longitude">{text || Strings.EMPTY_FIELD}</div>,
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
  TSFOperatingStatusCodeHash: getTSFOperatingStatusCodeOptionsHash(state),
  consequenceClassificationStatusCodeHash: getConsequenceClassificationStatusCodeOptionsHash(state),
});

export default connect(mapStateToProps)(MineTailingsTable);

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  getTSFOperatingStatusCodeOptionsHash,
  getConsequenceClassificationStatusCodeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import * as Strings from "@common/constants/strings";
import CoreTable from "@/components/common/CoreTable";
import { BOOLEAN_OPTIONS_HASH } from "@common/constants/strings";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { Button } from "antd";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";

const propTypes = {
  TSFOperatingStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  consequenceClassificationStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  tailings: PropTypes.arrayOf(PropTypes.any).isRequired,
  openEditTailingsModal: PropTypes.func.isRequired,
  handleEditTailings: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

const defaultProps = {};

export class MineTailingsTable extends Component {
  transformRowData = (tailings) => {
    return tailings.map((tailing) => {
      return {
        key: tailing.mine_tailings_storage_facility_guid,
        ...tailing,
      };
    });
  };

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
        dataIndex: "engineer_of_record",
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
      {
        key: "operations",
        render: (text, record) => {
          return (
            <div align="right">
              <AuthorizationWrapper permission={Permission.EDIT_REPORTS}>
                <Button
                  type="primary"
                  size="small"
                  ghost
                  onClick={(event) =>
                    this.props.openEditTailingsModal(event, this.props.handleEditTailings, record)
                  }
                >
                  <img src={EDIT_OUTLINE_VIOLET} alt="Edit Report" />
                </Button>
              </AuthorizationWrapper>
            </div>
          );
        },
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
  TSFOperatingStatusCodeHash: getTSFOperatingStatusCodeOptionsHash(state),
  consequenceClassificationStatusCodeHash: getConsequenceClassificationStatusCodeOptionsHash(state),
});

export default connect(mapStateToProps)(MineTailingsTable);

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Divider } from "antd";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { nullableStringSorter } from "@common/utils/helpers";
import CoreTable from "@mds/common/components/common/CoreTable";
import * as router from "@/constants/routes";
import { fetchMineVerifiedStatuses } from "@mds/common/redux/actionCreators/mineActionCreator";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import {
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";

/**
 * @class AdminVerifiedMinesList displays list of mineVerifiedStatuses for the admin page.
 */

const propTypes = {
  fetchMineVerifiedStatuses: PropTypes.func.isRequired,
  location: PropTypes.shape({ hash: PropTypes.string, pathname: PropTypes.string }).isRequired,
};

const columns = [
  {
    title: "Mine Name",
    dataIndex: "mine_name",
    key: "mine_name",
    render: (text, record) => (
      <div key={record.key} title="Mine Name">
        <Link to={router.MINE_SUMMARY.dynamicRoute(record.key)}>{text}</Link>
      </div>
    ),
    sorter: nullableStringSorter("mine_name"),
  },
  renderTextColumn("verifying_user", "Last Verified By", true),
  renderDateColumn("verifying_timestamp", "Last Verified On", true),
];

const transformRowData = (verifiedMinesList) =>
  verifiedMinesList.map(({ mine_guid, verifying_timestamp, ...rest }) => ({
    key: mine_guid,
    verifying_timestamp,
    ...rest,
  }));

export class AdminVerifiedMinesList extends Component {
  state = {
    isLoaded: false,
    verifiedMines: [],
    unverifiedMines: [],
  };

  componentWillMount() {
    this.props.fetchMineVerifiedStatuses().then((response) => {
      this.setState({
        isLoaded: true,
        verifiedMines: response.data
          .filter((vm) => vm.healthy_ind === true)
          .sort(this.compareMineName),
        unverifiedMines: response.data
          .filter((vm) => vm.healthy_ind === false)
          .sort(this.compareMineName),
      });
    });
  }

  compareMineName = (a, b) => a.mine_name.localeCompare(b.mine_name);

  render() {
    const lastPath = this.props.location.pathname.split("/").pop();
    const isVerified = lastPath === "verified";
    const data = isVerified ? this.state.verifiedMines : this.state.unverifiedMines;
    return (
      <div className="tab__content">
        <h2>Mine Verification</h2>
        <Divider />
        <br />
        <h4>
          {data.length} {isVerified ? "Verified Mine(s)" : "Mine(s) needing re-verification"}
        </h4>
        <CoreTable
          condition={this.state.isLoaded}
          dataSource={transformRowData(data)}
          columns={columns}
          scroll={{ y: 500 }}
        />
      </div>
    );
  }
}

AdminVerifiedMinesList.propTypes = propTypes;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineVerifiedStatuses,
    },
    dispatch
  );

export default compose(
  connect(null, mapDispatchToProps),
  AuthorizationGuard(Permission.ADMIN)
)(AdminVerifiedMinesList);

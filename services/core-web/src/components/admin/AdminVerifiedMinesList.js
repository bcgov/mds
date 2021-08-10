import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Divider } from "antd";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { formatDate } from "@common/utils/helpers";
import CoreTable from "@/components/common/CoreTable";
import * as router from "@/constants/routes";
import { fetchMineVerifiedStatuses } from "@common/actionCreators/mineActionCreator";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";

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
    width: 150,
    dataIndex: "mine_name",
    render: (text, record) => (
      <div key={record.key} title="Mine Name">
        <Link to={router.MINE_SUMMARY.dynamicRoute(record.key)}>{text}</Link>
      </div>
    ),
  },
  {
    title: "Last Verified By",
    width: 150,
    dataIndex: "verifying_user",
    render: (text) => <div title="Last Verified By">{text}</div>,
  },
  {
    title: "Last Verified On",
    width: 150,
    dataIndex: "formatted_timestamp",
    render: (text) => <div title="Last Verified On">{text}</div>,
  },
];

const transformRowData = (verifiedMinesList) =>
  verifiedMinesList.map(({ mine_guid, verifying_timestamp, ...rest }) => ({
    key: mine_guid,
    formatted_timestamp: formatDate(verifying_timestamp),
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
          tableProps={{
            align: "center",
            pagination: false,
            scroll: { y: 500 },
          }}
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

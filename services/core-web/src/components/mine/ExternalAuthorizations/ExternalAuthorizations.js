import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Divider, Tabs } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import CustomPropTypes from "@/customPropTypes";
import { getMineGuid } from "@mds/common/redux/selectors/mineSelectors";
import { getMineEpicInfo } from "@mds/common/redux/selectors/externalAuthorizationSelectors";
import { fetchMineEpicInformation } from "@mds/common/redux/actionCreators/externalAuthorizationActionCreator";
import EPICAuthorizationsTable from "@/components/mine/ExternalAuthorizations/EPICAuthorizationsTable";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineEpicInfo: CustomPropTypes.mineInfo.isRequired,
  fetchMineEpicInformation: PropTypes.func.isRequired,
};

const defaultProps = {};

export class ExternalAuthorizations extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchMineEpicInformation(this.props.mineGuid).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  render() {
    return (
      <div className="tab__content">
        <h2>Other Ministry Applications and Authorizations</h2>
        <Divider />
        <Tabs type="card" style={{ textAlign: "left !important" }}>
          <Tabs.TabPane
            tab={`Epic Authorizations (${
              this.state.isLoaded && this.props.mineEpicInfo.mine_info.projects !== null
                ? this.props.mineEpicInfo.mine_info.projects.length
                : "0"
            })`}
            key="1"
          >
            <>
              <br />
              <div className="inline-flex between">
                <h3 className="uppercase">EPIC Authorizations</h3>
              </div>
              <br />
              <EPICAuthorizationsTable
                isLoaded={this.state.isLoaded}
                data={this.props.mineEpicInfo}
              />
            </>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineGuid: getMineGuid(state),
  mineEpicInfo: getMineEpicInfo(state),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchMineEpicInformation }, dispatch);

ExternalAuthorizations.propTypes = propTypes;
ExternalAuthorizations.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ExternalAuthorizations);

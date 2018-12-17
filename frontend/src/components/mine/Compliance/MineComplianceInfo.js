import moment from "moment";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import Loading from "@/components/common/Loading";
import NullScreen from "@/components/common/NullScreen";
import { getMineComplianceInfo } from "@/selectors/complianceSelectors";
import { fetchMineComplianceInfo } from "@/actionCreators/complianceActionCreator";
/**
 * @class  MineTenureInfo - all tenure information related to the mine.
 */

const propTypes = {
  mine: PropTypes.object.isRequired,
  fetchMineComplianceInfo: PropTypes.func.isRequired,
  mineComplianceInfo: PropTypes.object,
};

const defaultProps = {
  mine: {},
};

export class MineComplianceInfo extends Component {
  state = { isLoading: true };

  componentDidMount() {
    this.props
      .fetchMineComplianceInfo(this.props.mine.mine_detail[0].mine_no)
      .then(() => this.setState({ isLoading: !this.state.isLoading }));
  }

  render() {
    // TODO need to work out how and what is being returned.
    return (
      <div>
        {this.state.isLoading && (
          <div>
            <Loading />
          </div>
        )}
        {!this.state.isLoading && (
          <div>
            <h4>Compliance Overview</h4>
            <br />
            <br />
            {this.props.mineComplianceInfo && (
              <div>
                <Row gutter={16} justify="center" align="top">
                  <Col span={2} />
                  <Col span={4}>
                    <div className="center">
                      <p className="info-display">
                        {moment(this.props.mineComplianceInfo.last_inspection).format(
                          "MMM DD YYYY"
                        )}
                      </p>
                      <p className="info-display-label">LAST INSPECTION DATE</p>
                    </div>
                  </Col>
                  <Col span={4} />
                  <Col span={4}>
                    <div className="center">
                      <p className="info-display">{this.props.mineComplianceInfo.overdue_orders}</p>
                      <p className="info-display-label">OVERDUE ORDERS</p>
                    </div>
                  </Col>
                  <Col span={4} />
                  <Col span={4}>
                    <div className="center">
                      <p className="info-display">{this.props.mineComplianceInfo.open_orders}</p>
                      <p className="info-display-label">OPEN ORDERS</p>
                    </div>
                  </Col>
                  <Col span={2} />
                </Row>
                <br />
                <br />
                <Row gutter={16} justify="center" align="top">
                  <Col span={2} />
                  <Col span={4}>
                    <div className="center">
                      <p className="info-display">{this.props.mineComplianceInfo.warnings}</p>
                      <p className="info-display-label">WARNINGS ISSUED IN THE PAST YEAR</p>
                    </div>
                  </Col>
                  <Col span={4} />
                  <Col span={4}>
                    <div className="center">
                      <p className="info-display">{this.props.mineComplianceInfo.advisories}</p>
                      <p className="info-display-label">ADVISORIES ISSUED IN THE PAST YEAR</p>
                    </div>
                  </Col>
                  <Col span={4} />
                  <Col span={4}>
                    <div className="center">
                      <p className="info-display">
                        {this.props.mineComplianceInfo.section_35_orders} - Section 35
                      </p>
                      <p className="info-display-label">TOTAL</p>
                    </div>
                  </Col>
                  <Col span={2} />
                </Row>
              </div>
            )}
            {!this.props.mineComplianceInfo && <NullScreen type="generic" />}
          </div>
        )}
      </div>
    );
  }
}

MineComplianceInfo.propTypes = propTypes;
MineComplianceInfo.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mineComplianceInfo: getMineComplianceInfo(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineComplianceInfo,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineComplianceInfo);

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import EnvironmentOutlined from "@ant-design/icons/EnvironmentOutlined";
import { Row, Col, Divider, Typography } from "antd";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { getUserInfo, isProponent } from "@mds/common/redux/selectors/authenticationSelectors";
import { getUserMineInfo } from "@/selectors/userMineSelectors";
import { fetchUserMineInfo } from "@/actionCreators/userDashboardActionCreator";
import CustomPropTypes from "@/customPropTypes";
import Loading from "@/components/common/Loading";
import * as routes from "@/constants/routes";
import * as Strings from "@/constants/strings";
import Map from "@/components/common/Map";
import UnauthenticatedNotice from "../common/UnauthenticatedNotice";
import { detectDevelopmentEnvironment } from "@mds/common";

const propTypes = {
  userInfo: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchUserMineInfo: PropTypes.func.isRequired,
  userMineInfo: CustomPropTypes.userMines.isRequired,
  isProponent: PropTypes.bool.isRequired,
};

export class MinesPage extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchUserMineInfo().then(() => this.setState({ isLoaded: true }));
  }

  render() {
    const { mines } = this.props.userMineInfo;
    const isProdOrTest = !detectDevelopmentEnvironment();
    if (!this.props.isProponent && isProdOrTest) {
      return <UnauthenticatedNotice />;
    }
    return (
      (this.state.isLoaded && (
        <Row>
          <Col span={24}>
            <Typography.Title>My Mines</Typography.Title>
            <Divider />
            <Typography.Title level={4}>
              Welcome, {this.props.userInfo.preferred_username}.
            </Typography.Title>
            {(mines && mines.length > 0 && (
              <Row gutter={32}>
                <Col xl={12} lg={14} sm={24}>
                  <Typography.Paragraph>
                    You are authorized to submit information for the following mines:
                  </Typography.Paragraph>
                  <div className="link-card">
                    <ul>
                      {mines
                        .sort((a, b) => (a.mine_name > b.mine_name ? 1 : -1))
                        .map((mine) => (
                          <li key={mine.mine_guid}>
                            <Link to={routes.MINE_DASHBOARD.dynamicRoute(mine.mine_guid)}>
                              <Typography.Title level={4}>
                                <EnvironmentOutlined style={{ paddingRight: "5px" }} />
                                {mine.mine_name}
                              </Typography.Title>
                              <Typography.Text>
                                Mine Number: {mine.mine_no || Strings.EMPTY_FIELD}
                              </Typography.Text>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </Col>
                <Col xl={12} lg={10} sm={0}>
                  <div style={{ height: "400px", marginTop: "-32px" }}>
                    <Map
                      controls={false}
                      additionalPins={mines.map((mine) => [mine.latitude, mine.longitude])}
                    />
                  </div>
                  <Typography.Paragraph style={{ paddingTop: "16px" }}>
                    Don&apos;t see the mine you&apos;re looking for? Contact&nbsp;
                    <a href={`mailto:${Strings.MDS_EMAIL}`}>{Strings.MDS_EMAIL}</a>
                    &nbsp;for assistance.
                  </Typography.Paragraph>
                </Col>
              </Row>
            )) || (
              <Row>
                <Col span={24}>
                  <Typography.Paragraph>
                    You are not authorized to manage information for any mines. Please contact&nbsp;
                    <a className="underline" href={Strings.MDS_EMAIL}>
                      {Strings.MDS_EMAIL}
                    </a>
                    &nbsp;for assistance.
                  </Typography.Paragraph>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      )) || <Loading />
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  userMineInfo: getUserMineInfo(state),
  isProponent: isProponent(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchUserMineInfo,
    },
    dispatch
  );

MinesPage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MinesPage);

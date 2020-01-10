import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { getUserInfo } from "@/selectors/authenticationSelectors";
import { getUserMineInfo } from "@/selectors/userMineSelectors";
import { fetchUserMineInfo } from "@/actionCreators/userDashboardActionCreator";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import QuestionSidebar from "@/components/common/QuestionsSidebar";
import Loading from "@/components/common/Loading";
import * as routes from "@/constants/routes";
import * as Strings from "@/constants/strings";

const propTypes = {
  userInfo: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchUserMineInfo: PropTypes.func.isRequired,
  userMineInfo: CustomPropTypes.userMines.isRequired,
};

export class UserDashboard extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchUserMineInfo().then(() => this.setState({ isLoaded: true }));
  }

  render() {
    if (!this.state.isLoaded) {
      return <Loading />;
    }
    const { mines } = this.props.userMineInfo;
    return (
      <div className="user-dashboard-padding">
        {(mines && mines.length > 0 && (
          <div className="inline-flex between block-tablet">
            <div>
              <div>
                <h1 className="user-title"> Welcome, {this.props.userInfo.preferred_username}.</h1>
                <p className="large-padding-bot">
                  You are authorized to submit information for the following mines:
                </p>
              </div>
              <ul className="user-mine-list">
                {mines.map((mine) => (
                  <li key={mine.mine_guid}>
                    <Link to={routes.MINE_DASHBOARD.dynamicRoute(mine.mine_guid)}>
                      {mine.mine_name}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="large-padding-top">
                Don&#39;t see the mine you&#39;re looking for? Contact&nbsp;
                <a className="underline" href={`mailto:${Strings.MDS_EMAIL}`}>
                  {Strings.MDS_EMAIL}
                </a>
                &nbsp;for assistance.
              </p>
            </div>
            <QuestionSidebar />
          </div>
        )) || <NullScreen type="no-mines" />}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  userMineInfo: getUserMineInfo(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchUserMineInfo,
    },
    dispatch
  );

UserDashboard.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserDashboard);

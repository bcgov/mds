import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import QuestionSidebar from "@/components/common/QuestionsSidebar";
import * as routes from "@/constants/routes";
import { fetchMineRecordById } from "@/actionCreators/userDashboardActionCreator";
import { getMine } from "@/selectors/userMineSelectors";
import CustomPropTypes from "@/customPropTypes";
import { SINGLE_DOCUMENT, DOCUMENTS } from "@/constants/assets";
import Loading from "@/components/common/Loading";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
};

export class MineDashboard extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchMineRecordById(id).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  renderLinkCards = (id) => (
    <div className="inline-flex flex-start">
      <div>
        <Link to={routes.REPORTS.dynamicRoute(id)}>
          <div className="link-container">
            <div className="link-container--content">
              <img src={DOCUMENTS} alt="document" />
              <h4>Reporting</h4>
            </div>
          </div>
        </Link>
      </div>
      <AuthorizationWrapper inTesting>
        <Link to={routes.VARIANCES.dynamicRoute(id)}>
          <div className="link-container">
            <div className="link-container--content">
              <img src={SINGLE_DOCUMENT} alt="document" />
              <h4>Variances</h4>
            </div>
          </div>
        </Link>
      </AuthorizationWrapper>
    </div>
  );

  render() {
    const { id } = this.props.match.params;
    return (
      <div className="user-dashboard-padding">
        {this.state.isLoaded ? (
          <div className="inline-flex between block-tablet">
            <div>
              <h1 className="mine-title">{this.props.mine.mine_name}</h1>
              <p>Mine No. {this.props.mine.mine_no}</p>
              <br />
              {this.renderLinkCards(id)}
            </div>
            <QuestionSidebar />
          </div>
        ) : (
          <Loading />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mine: getMine(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
    },
    dispatch
  );

MineDashboard.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineDashboard);

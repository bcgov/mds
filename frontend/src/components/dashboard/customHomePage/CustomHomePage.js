import React, { Component } from "react";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getCommodityOptionHash,
} from "@/selectors/staticContentSelectors";
import {
  fetchRegionOptions,
  fetchMineTenureTypes,
  fetchMineCommodityOptions,
} from "@/actionCreators/staticContentActionCreator";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { getSubscribedMines } from "@/selectors/mineSelectors";
import { fetchSubscribedMinesByUser, unSubscribe } from "@/actionCreators/mineActionCreator";
import { fetchVariances } from "@/actionCreators/varianceActionCreator";
import {
  getVarianceApplicationsInReview,
  getApprovedVariances,
} from "@/selectors/varianceSelectors";
import { SubscriptionTable } from "./SubscriptionTable";
import { VarianceTables } from "@/components/dashboard/customHomePage/VarianceTables";

/**
 * @class CustomHomePage is a personalized landing page for users
 *
 */

const propTypes = {
  fetchSubscribedMinesByUser: PropTypes.func.isRequired,
  fetchMineTenureTypes: PropTypes.func.isRequired,
  fetchRegionOptions: PropTypes.func.isRequired,
  fetchMineCommodityOptions: PropTypes.func.isRequired,
  unSubscribe: PropTypes.func.isRequired,
  fetchVariances: PropTypes.func.isRequired,
  subscribedMines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  approvedVariances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  variancesInReview: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
};

export class CustomHomePage extends Component {
  componentDidMount() {
    this.props.fetchSubscribedMinesByUser();
    this.props.fetchVariances();
    this.props.fetchMineTenureTypes();
    this.props.fetchRegionOptions();
    this.props.fetchMineCommodityOptions();
  }

  handleUnSubscribe = (event, mineGuid, mineName) => {
    event.preventDefault();
    this.props.unSubscribe(mineGuid, mineName).then(() => {
      this.props.fetchSubscribedMinesByUser();
    });
  };

  render() {
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <h1>My Dashboard</h1>
        </div>
        <div className="landing-page__content">
          <VarianceTables
            variancesInReview={this.props.variancesInReview}
            approvedVariances={this.props.approvedVariances}
          />
          <SubscriptionTable
            subscribedMines={this.props.subscribedMines}
            mineRegionHash={this.props.mineRegionHash}
            mineTenureHash={this.props.mineTenureHash}
            mineCommodityOptionsHash={this.props.mineCommodityOptionsHash}
            handleUnSubscribe={this.handleUnSubscribe}
          />
        </div>
      </div>
    );
  }
}

CustomHomePage.propTypes = propTypes;

const mapStateToProps = (state) => ({
  subscribedMines: getSubscribedMines(state),
  mineRegionHash: getMineRegionHash(state),
  mineTenureHash: getMineTenureTypesHash(state),
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  variancesInReview: getVarianceApplicationsInReview(state),
  approvedVariances: getApprovedVariances(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSubscribedMinesByUser,
      unSubscribe,
      fetchVariances,
      fetchRegionOptions,
      fetchMineTenureTypes,
      fetchMineCommodityOptions,
    },
    dispatch
  );

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  AuthorizationGuard(Permission.IN_TESTING)
)(CustomHomePage);

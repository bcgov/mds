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
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { getSubscribedMines } from "@/selectors/mineSelectors";
import { fetchSubscribedMinesByUser, unSubscribe } from "@/actionCreators/mineActionCreator";
import { MineSubscriptionTable } from "./MineSubscriptionTable";

/**
 * @class CustomHomePage is a personalized landing page for users
 *
 */

const propTypes = {
  fetchSubscribedMinesByUser: PropTypes.func.isRequired,
  unSubscribe: PropTypes.func.isRequired,
  subscribedMines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class CustomHomePage extends Component {
  componentDidMount() {
    this.props.fetchSubscribedMinesByUser();
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
          <MineSubscriptionTable
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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSubscribedMinesByUser,
      unSubscribe,
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

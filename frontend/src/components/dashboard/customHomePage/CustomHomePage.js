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
import { MineSubscriptionTable } from "./MineSubscriptionTable";

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
  subscribedMines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class CustomHomePage extends Component {
  componentDidMount() {
    this.props.fetchSubscribedMinesByUser();
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

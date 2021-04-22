import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getCommodityOptionHash,
  getHSRCMComplianceCodesHash,
} from "@common/selectors/staticContentSelectors";
import { getSubscribedMines } from "@common/selectors/mineSelectors";
import { fetchSubscribedMinesByUser, unSubscribe } from "@common/actionCreators/mineActionCreator";
import CustomPropTypes from "@/customPropTypes";
import { SubscriptionTable } from "./SubscriptionTable";
import { SubscribedTargetsTable } from "./SubscribedTargetsTable";
import { fetchCoreActivityTargets } from "@common/actionCreators/activityActionCreator";
import { getCoreActivityTargets } from "@common/selectors/activitySelectors";

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
  coreActivityTargets: PropTypes.objectOf(PropTypes.any).isRequired,
  fetchCoreActivityTargets: PropTypes.func.isRequired,
};
export class CustomHomePage extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchCoreActivityTargets();
    this.props.fetchSubscribedMinesByUser().then(() => {
      this.setState({ isLoaded: true });
    });
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
        <div className="landing-page__content page__content">
          <h4>Subscribed Mines?</h4>
          <br />
          <SubscriptionTable
            isLoaded={this.state.isLoaded}
            subscribedMines={this.props.subscribedMines}
            mineRegionHash={this.props.mineRegionHash}
            mineTenureHash={this.props.mineTenureHash}
            mineCommodityOptionsHash={this.props.mineCommodityOptionsHash}
            handleUnSubscribe={this.handleUnSubscribe}
          />
          <br />
          <h4>Subscribed EVERYTHING!</h4>
          <br />
          <SubscribedTargetsTable 
            isLoaded={this.state.isLoaded}
            coreActivityTargets={this.props.coreActivityTargets}
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
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  coreActivityTargets: getCoreActivityTargets(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSubscribedMinesByUser,
      unSubscribe,
      openModal,
      closeModal,
      fetchCoreActivityTargets,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(CustomHomePage);

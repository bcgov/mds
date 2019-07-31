import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import {
  fetchRegionOptions,
  fetchMineTenureTypes,
  fetchMineCommodityOptions,
  fetchMineComplianceCodes,
  fetchVarianceStatusOptions,
  fetchVarianceDocumentCategoryOptions,
} from "@/actionCreators/staticContentActionCreator";
import { openModal, closeModal } from "@/actions/modalActions";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getCommodityOptionHash,
  getHSRCMComplianceCodesHash,
  getFilterVarianceStatusOptions,
} from "@/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import { getSubscribedMines } from "@/selectors/mineSelectors";
import { fetchSubscribedMinesByUser, unSubscribe } from "@/actionCreators/mineActionCreator";
import {
  fetchVariances,
  updateVariance,
  addDocumentToVariance,
} from "@/actionCreators/varianceActionCreator";
import { getVariances, getVariancePageData } from "@/selectors/varianceSelectors";
import { SubscriptionTable } from "./SubscriptionTable";
import { fetchInspectors } from "@/actionCreators/partiesActionCreator";

/**
 * @class CustomHomePage is a personalized landing page for users
 *
 */

const propTypes = {
  fetchSubscribedMinesByUser: PropTypes.func.isRequired,
  fetchMineTenureTypes: PropTypes.func.isRequired,
  fetchVarianceDocumentCategoryOptions: PropTypes.func.isRequired,
  fetchMineComplianceCodes: PropTypes.func.isRequired,
  fetchRegionOptions: PropTypes.func.isRequired,
  fetchInspectors: PropTypes.func.isRequired,
  fetchMineCommodityOptions: PropTypes.func.isRequired,
  fetchVarianceStatusOptions: PropTypes.func.isRequired,
  unSubscribe: PropTypes.func.isRequired,
  subscribedMines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class CustomHomePage extends Component {
  componentDidMount() {
    this.props.fetchSubscribedMinesByUser();
    this.props.fetchInspectors();
    this.props.fetchMineTenureTypes();
    this.props.fetchMineComplianceCodes();
    this.props.fetchRegionOptions();
    this.props.fetchMineCommodityOptions();
    this.props.fetchVarianceStatusOptions();
    this.props.fetchVarianceDocumentCategoryOptions();
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
  variancePageData: getVariancePageData(state),
  variances: getVariances(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  filterVarianceStatusOptions: getFilterVarianceStatusOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSubscribedMinesByUser,
      unSubscribe,
      fetchVariances,
      updateVariance,
      openModal,
      closeModal,
      fetchRegionOptions,
      addDocumentToVariance,
      fetchMineTenureTypes,
      fetchMineComplianceCodes,
      fetchMineCommodityOptions,
      fetchVarianceStatusOptions,
      fetchVarianceDocumentCategoryOptions,
      fetchInspectors,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomHomePage);

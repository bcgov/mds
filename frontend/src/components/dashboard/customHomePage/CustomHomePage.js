import React, { Component } from "react";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import {
  fetchRegionOptions,
  fetchMineTenureTypes,
  fetchMineCommodityOptions,
  fetchMineComplianceCodes,
  fetchVarianceStatusOptions,
} from "@/actionCreators/staticContentActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getCommodityOptionHash,
  getHSRCMComplianceCodesHash,
  getDropdownVarianceStatusOptions,
  getDropdownVarianceDocumentCategoryOptions,
  getVarianceDocumentCategoryOptionsHash,
} from "@/selectors/staticContentSelectors";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { getSubscribedMines } from "@/selectors/mineSelectors";
import { getDropdownInspectors } from "@/selectors/partiesSelectors";
import { fetchSubscribedMinesByUser, unSubscribe } from "@/actionCreators/mineActionCreator";
import { fetchVariances } from "@/actionCreators/varianceActionCreator";
import { getVariances, getVariancePageData } from "@/selectors/varianceSelectors";
import { SubscriptionTable } from "./SubscriptionTable";
import { VarianceTables } from "@/components/dashboard/customHomePage/VarianceTables";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import * as Strings from "@/constants/strings";
import { fetchInspectors } from "@/actionCreators/partiesActionCreator";

/**
 * @class CustomHomePage is a personalized landing page for users
 *
 */

const propTypes = {
  fetchSubscribedMinesByUser: PropTypes.func.isRequired,
  fetchMineTenureTypes: PropTypes.func.isRequired,
  fetchMineComplianceCodes: PropTypes.func.isRequired,
  fetchRegionOptions: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchInspectors: PropTypes.func.isRequired,
  fetchMineCommodityOptions: PropTypes.func.isRequired,
  fetchVarianceStatusOptions: PropTypes.func.isRequired,
  unSubscribe: PropTypes.func.isRequired,
  fetchVariances: PropTypes.func.isRequired,
  subscribedMines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  variancePageData: CustomPropTypes.variancePageData.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  inspectors: CustomPropTypes.options.isRequired,
  varianceDocumentCategoryOptions: CustomPropTypes.options.isRequired,
  varianceDocumentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceStatusOptions: CustomPropTypes.options.isRequired,
};

export class CustomHomePage extends Component {
  state = {
    variancesLoaded: false,
    params: {
      variance_application_status_code: [
        Strings.VARIANCE_APPLICATION_CODE,
        Strings.VARIANCE_DECISION_CODE,
      ],
      page: Strings.DEFAULT_PAGE,
      per_page: 10,
    },
  };

  componentDidMount() {
    this.props.fetchSubscribedMinesByUser();
    this.props.fetchVariances(this.state.params).then(() => {
      this.setState({ variancesLoaded: true });
    });
    this.props.fetchInspectors();
    this.props.fetchMineTenureTypes();
    this.props.fetchMineComplianceCodes();
    this.props.fetchRegionOptions();
    this.props.fetchMineCommodityOptions();
    this.props.fetchVarianceStatusOptions();
  }

  handleUnSubscribe = (event, mineGuid, mineName) => {
    event.preventDefault();
    this.props.unSubscribe(mineGuid, mineName).then(() => {
      this.props.fetchSubscribedMinesByUser();
    });
  };

  handleVariancePageChange = (page, per_page) => {
    this.setState({ variancesLoaded: false });
    const params = { page, per_page, ...this.state.params };
    return this.props.fetchVariances(params).then(() => {
      this.setState({ variancesLoaded: true });
    });
  };

  handleUpdateVariance = () => {
    // do something here
    this.props.closeModal();
  };

  openEditVarianceModal = (variance) => {
    this.props.openModal({
      props: {
        onSubmit: this.handleUpdateVariance,
        title: this.props.complianceCodesHash[variance.compliance_article_id],
        mineGuid: variance.mine_guid,
        mineName: variance.mine_guid,
        varianceGuid: variance.variance_guid,
        documentCategoryOptions: this.props.varianceDocumentCategoryOptions,
        documentCategoryOptionsHash: this.props.varianceDocumentCategoryOptionsHash,
        inspectors: this.props.inspectors,
        complianceCodesHash: this.props.complianceCodesHash,
        varianceStatusOptions: this.props.varianceStatusOptions,
      },
      content: modalConfig.EDIT_VARIANCE,
    });
  };

  render() {
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <h1>My Dashboard</h1>
        </div>
        <div className="landing-page__content">
          <LoadingWrapper condition={this.state.variancesLoaded}>
            <VarianceTables
              variances={this.props.variances}
              pageData={this.props.variancePageData}
              handlePageChange={this.handleVariancePageChange}
              params={this.state.params}
              openModal={this.openEditVarianceModal}
            />
          </LoadingWrapper>
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
  inspectors: getDropdownInspectors(state),
  varianceDocumentCategoryOptions: getDropdownVarianceDocumentCategoryOptions(state),
  varianceDocumentCategoryOptionsHash: getVarianceDocumentCategoryOptionsHash(state),
  varianceStatusOptions: getDropdownVarianceStatusOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSubscribedMinesByUser,
      unSubscribe,
      fetchVariances,
      openModal,
      closeModal,
      fetchRegionOptions,
      fetchMineTenureTypes,
      fetchMineComplianceCodes,
      fetchMineCommodityOptions,
      fetchVarianceStatusOptions,
      fetchInspectors,
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

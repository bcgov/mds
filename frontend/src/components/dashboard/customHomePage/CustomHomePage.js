import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { compose, bindActionCreators } from "redux";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import {
  fetchRegionOptions,
  fetchMineTenureTypes,
  fetchMineCommodityOptions,
  fetchMineComplianceCodes,
  fetchVarianceStatusOptions,
  fetchVarianceDocumentCategoryOptions,
} from "@/actionCreators/staticContentActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getCommodityOptionHash,
  getHSRCMComplianceCodesHash,
} from "@/selectors/staticContentSelectors";
import PropTypes from "prop-types";
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
import { VarianceTable } from "@/components/dashboard/customHomePage/VarianceTable";
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
  fetchVarianceDocumentCategoryOptions: PropTypes.func.isRequired,
  addDocumentToVariance: PropTypes.func.isRequired,
  updateVariance: PropTypes.func.isRequired,
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
      per_page: 5,
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
    this.props.fetchVarianceDocumentCategoryOptions();
  }

  handleUnSubscribe = (event, mineGuid, mineName) => {
    event.preventDefault();
    this.props.unSubscribe(mineGuid, mineName).then(() => {
      this.props.fetchSubscribedMinesByUser();
    });
  };

  handleVariancePageChange = (page, per_page) => {
    this.setState({ variancesLoaded: false });
    const params = { ...this.state.params, page, per_page };
    return this.props.fetchVariances(params).then(() => {
      this.setState({ variancesLoaded: true, params });
    });
  };

  handleUpdateVariance = (files, variance, isApproved) => (values) => {
    // if the application isApproved, set issue_date to today and set expiry_date 5 years from today,
    // unless the user sets a custom expiry.
    const { variance_document_category_code } = values;
    const issue_date = isApproved ? moment().format("YYYY-MM-DD") : null;
    let expiry_date;
    if (isApproved) {
      expiry_date = values.expiry_date
        ? values.expiry_date
        : moment(issue_date, "YYYY-MM-DD").add(5, "years");
    }
    const newValues = { ...values, issue_date, expiry_date };
    const mineGuid = variance.mine_guid;
    const varianceGuid = variance.variance_guid;
    const codeLabel = this.props.complianceCodesHash[variance.compliance_article_id];
    this.props.updateVariance({ mineGuid, varianceGuid, codeLabel }, newValues).then(async () => {
      await Promise.all(
        Object.entries(files).map(([document_manager_guid, document_name]) =>
          this.props.addDocumentToVariance(
            { mineGuid, varianceGuid },
            {
              document_manager_guid,
              document_name,
              variance_document_category_code,
            }
          )
        )
      );
      this.props.closeModal();
      this.props.fetchVariances(this.state.params).then(() => {
        this.setState({ variancesLoaded: true });
      });
    });
  };

  openEditVarianceModal = (variance) => {
    this.props.openModal({
      props: {
        onSubmit: this.handleUpdateVariance,
        title: this.props.complianceCodesHash[variance.compliance_article_id],
        mineGuid: variance.mine_guid,
        mineName: variance.mine_name,
        varianceGuid: variance.variance_guid,
      },
      content: modalConfig.EDIT_VARIANCE,
    });
  };

  handleFilterChange = (pagination, filters) => {
    const { status } = filters;
    console.log(status);
    const statusParam = status.length >= 1 ? { variance_application_status_code: status } : "";
    console.log(filters);
    this.setState({ variancesLoaded: false });
    const params = { ...this.state.params, ...statusParam };
    return this.props.fetchVariances(params).then(() => {
      this.setState({ variancesLoaded: true, params });
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
            <VarianceTable
              handleFilterChange={this.handleFilterChange}
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

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  AuthorizationGuard(Permission.IN_TESTING)
)(CustomHomePage);

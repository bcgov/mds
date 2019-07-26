import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import PropTypes from "prop-types";
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
  getFilterVarianceStatusOptions,
  getMultiSelectComplianceCodes,
} from "@/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import {
  fetchVariances,
  updateVariance,
  addDocumentToVariance,
} from "@/actionCreators/varianceActionCreator";
import { getVariances, getVariancePageData } from "@/selectors/varianceSelectors";
import { VarianceTable } from "@/components/dashboard/customHomePage/VarianceTable";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import * as Strings from "@/constants/strings";
import { fetchInspectors } from "@/actionCreators/partiesActionCreator";
import VarianceSearch from "./VarianceSearch";
/**
 * @class Variance page is a landing page for variance searching
 *
 */

const propTypes = {
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
  fetchVariances: PropTypes.func.isRequired,
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  variancePageData: CustomPropTypes.variancePageData.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  filterVarianceStatusOptions: CustomPropTypes.filterOptions.isRequired,
};

export class CustomHomePage extends Component {
  state = {
    variancesLoaded: false,
    params: {
      variance_application_status_code: [],
      page: Strings.DEFAULT_PAGE,
      per_page: 5,
    },
  };

  componentDidMount() {
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

  handleVariancePageChange = (page, per_page) => {
    this.setState({ variancesLoaded: false });
    const params = { ...this.state.params, page, per_page };
    return this.props.fetchVariances(params).then(() => {
      this.setState({
        variancesLoaded: true,
        params,
      });
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

  openViewVarianceModal = (variance) => {
    this.props.openModal({
      props: {
        variance,
        title: this.props.complianceCodesHash[variance.compliance_article_id],
        mineName: variance.mine_name,
      },
      content: modalConfig.VIEW_VARIANCE,
      isViewOnly: true,
    });
  };

  handleFilterChange = (pagination, filters) => {
    const { status } = filters;
    this.setState({ variancesLoaded: false });
    const params = {
      ...this.state.params,
      variance_application_status_code: status,
      page: 1,
    };
    return this.props.fetchVariances(params).then(() => {
      this.setState({
        variancesLoaded: true,
        params,
      });
    });
  };

  render() {
    // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%");
    // console.log(this.props.multiSelectComplianceCodes);
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <h1>Browse Variances</h1>
        </div>
        <div className="landing-page__content">
          <VarianceSearch
            handleNameFieldReset={this.handleNameFieldReset}
            initialValues={this.state.params}
            handleSearch={this.handleSearch}
            // eslint-disable-next-line react/prop-types
            complianceCodes={this.props.multiSelectComplianceCodes}
          />
          <LoadingWrapper condition={this.state.variancesLoaded}>
            <VarianceTable
              filterVarianceStatusOptions={this.props.filterVarianceStatusOptions}
              isApplication={this.state.isApplication}
              handleFilterChange={this.handleFilterChange}
              variances={this.props.variances}
              pageData={this.props.variancePageData}
              handlePageChange={this.handleVariancePageChange}
              params={this.state.params}
              openEditVarianceModal={this.openEditVarianceModal}
              openViewVarianceModal={this.openViewVarianceModal}
            />
          </LoadingWrapper>
        </div>
      </div>
    );
  }
}

CustomHomePage.propTypes = propTypes;

const mapStateToProps = (state) => ({
  mineRegionHash: getMineRegionHash(state),
  mineTenureHash: getMineTenureTypesHash(state),
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  variancePageData: getVariancePageData(state),
  variances: getVariances(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  multiSelectComplianceCodes: getMultiSelectComplianceCodes(state),
  filterVarianceStatusOptions: getFilterVarianceStatusOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
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

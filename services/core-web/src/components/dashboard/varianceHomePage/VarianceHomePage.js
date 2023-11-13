import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import queryString from "query-string";
import moment from "moment";
import PropTypes from "prop-types";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getCommodityOptionHash,
  getHSRCMComplianceCodesHash,
  getFilterVarianceStatusOptions,
  getDropdownHSRCMComplianceCodes,
  getMineRegionDropdownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getVariances, getVariancePageData } from "@mds/common/redux/selectors/varianceSelectors";
import {
  fetchVariances,
  updateVariance,
  deleteVariance,
  addDocumentToVariance,
} from "@mds/common/redux/actionCreators/varianceActionCreator";
import * as Strings from "@mds/common/constants/strings";
import { PageTracker } from "@common/utils/trackers";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import { VarianceTable } from "@/components/dashboard/customHomePage/VarianceTable";
import * as router from "@/constants/routes";
import VarianceSearch from "./VarianceSearch";

/**
 * @class Variance page is a landing page for variance searching
 *
 */

const propTypes = {
  addDocumentToVariance: PropTypes.func.isRequired,
  updateVariance: PropTypes.func.isRequired,
  deleteVariance: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchVariances: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  variancePageData: CustomPropTypes.variancePageData.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  getDropdownHSRCMComplianceCodes: CustomPropTypes.options.isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  filterVarianceStatusOptions: CustomPropTypes.filterOptions.isRequired,
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
};

const defaultParams = {
  page: Strings.DEFAULT_PAGE,
  per_page: Strings.DEFAULT_PER_PAGE,
  compliance_code: [],
  variance_application_status_code: [],
  region: [],
  search: undefined,
  issue_date_after: undefined,
  issue_date_before: undefined,
  expiry_date_before: undefined,
  expiry_date_after: undefined,
  major: undefined,
  sort_field: "received_date",
  sort_dir: "desc",
};

export class VarianceHomePage extends Component {
  params = queryString.parse(this.props.location.search);

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      params: defaultParams,
    };
  }

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    this.setState(
      (prevState) => ({
        params: {
          ...prevState.params,
          ...params,
        },
      }),
      () => this.props.history.replace(router.VARIANCE_DASHBOARD.dynamicRoute(this.state.params))
    );
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      this.setState({ isLoaded: false }, () => this.renderDataFromURL(nextProps.location.search));
    }
  }

  renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);
    this.setState({ isLoaded: false });
    this.props.fetchVariances(parsedParams).then(() => {
      this.setState({ isLoaded: true });
    });
  };

  clearParams = () => {
    this.setState(
      (prevState) => ({
        params: {
          ...defaultParams,
          per_page: prevState.params.per_page || defaultParams.per_page,
          sort_field: prevState.params.sort_field,
          sort_dir: prevState.params.sort_dir,
        },
      }),
      () => {
        this.props.history.replace(router.VARIANCE_DASHBOARD.dynamicRoute(this.state.params));
      }
    );
  };

  handleVarianceSearch = (params) => {
    this.setState(
      {
        params,
      },
      () => this.props.history.replace(router.VARIANCE_DASHBOARD.dynamicRoute(this.state.params))
    );
  };

  onPageChange = (page, per_page) => {
    this.setState(
      (prevState) => ({ params: { ...prevState.params, page, per_page } }),
      () => this.props.history.replace(router.VARIANCE_DASHBOARD.dynamicRoute(this.state.params))
    );
  };

  handleUpdateVariance = (files, variance, isApproved) => (values) => {
    // If the application is approved, set the issue date to today and set the expiry date to 5 years from today if it is empty.
    const { variance_document_category_code } = values;
    let expiry_date;
    let issue_date;
    if (isApproved) {
      issue_date = values.issue_date ? values.issue_date : moment().format("YYYY-MM-DD");
      expiry_date = values.expiry_date
        ? values.expiry_date
        : moment(issue_date, "YYYY-MM-DD").add(5, "years");
    }
    const newValues = { ...values, issue_date, expiry_date };
    const mineGuid = variance.mine_guid;
    const varianceGuid = variance.variance_guid;
    const codeLabel = this.props.complianceCodesHash[variance.compliance_article_id];
    return this.props
      .updateVariance({ mineGuid, varianceGuid, codeLabel }, newValues)
      .then(async () => {
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
        ).then(() => {
          this.props.closeModal();
          this.setState({ isLoaded: false });
          this.props
            .fetchVariances(this.state.params)
            .finally(() => this.setState({ isLoaded: true }));
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

  handleDeleteVariance = (variance) => {
    return this.props.deleteVariance(variance.mine_guid, variance.variance_guid).then(() => {
      this.props.fetchVariances(this.state.params).then(() => {
        this.setState({ isLoaded: true });
      });
    });
  };

  render() {
    return (
      <div className="landing-page">
        <PageTracker title="Variance Page" />
        <div className="landing-page__header">
          <div>
            <h1>Browse Variances</h1>
          </div>
        </div>
        <div className="landing-page__content">
          <div className="page__content">
            <VarianceSearch
              handleNameFieldReset={this.handleNameFieldReset}
              initialValues={this.state.params}
              handleReset={this.clearParams}
              fetchVariances={this.props.fetchVariances}
              handleVarianceSearch={this.handleVarianceSearch}
              mineRegionOptions={this.props.mineRegionOptions}
              complianceCodes={this.props.getDropdownHSRCMComplianceCodes}
              filterVarianceStatusOptions={this.props.filterVarianceStatusOptions}
            />
            <div>
              <VarianceTable
                isLoaded={this.state.isLoaded}
                isApplication={this.state.isApplication}
                variances={this.props.variances}
                pageData={this.props.variancePageData}
                handlePageChange={this.onPageChange}
                handleVarianceSearch={this.handleVarianceSearch}
                params={this.state.params}
                openEditVarianceModal={this.openEditVarianceModal}
                openViewVarianceModal={this.openViewVarianceModal}
                handleDeleteVariance={this.handleDeleteVariance}
                sortField={this.state.params.sort_field}
                sortDir={this.state.params.sort_dir}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

VarianceHomePage.propTypes = propTypes;

const mapStateToProps = (state) => ({
  mineRegionHash: getMineRegionHash(state),
  mineTenureHash: getMineTenureTypesHash(state),
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  variancePageData: getVariancePageData(state),
  variances: getVariances(state),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  getDropdownHSRCMComplianceCodes: getDropdownHSRCMComplianceCodes(state),
  mineRegionOptions: getMineRegionDropdownOptions(state),
  filterVarianceStatusOptions: getFilterVarianceStatusOptions(state, false),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchVariances,
      updateVariance,
      deleteVariance,
      openModal,
      closeModal,
      addDocumentToVariance,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(VarianceHomePage);

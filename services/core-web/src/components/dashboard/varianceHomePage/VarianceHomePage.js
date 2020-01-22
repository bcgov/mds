import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { debounce, isEmpty } from "lodash";
import queryString from "query-string";
import moment from "moment";
import PropTypes from "prop-types";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getCommodityOptionHash,
  getHSRCMComplianceCodesHash,
  getFilterVarianceStatusOptions,
  getDropdownHSRCMComplianceCodes,
  getMineRegionDropdownOptions,
} from "@/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import {
  fetchVariances,
  updateVariance,
  addDocumentToVariance,
} from "@/actionCreators/varianceActionCreator";
import { getVariances, getVariancePageData } from "@/selectors/varianceSelectors";
import { VarianceTable } from "@/components/dashboard/customHomePage/VarianceTable";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import VarianceSearch from "./VarianceSearch";
import { formatParamStringToArray } from "@/utils/helpers";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

/**
 * @class Variance page is a landing page for variance searching
 *
 */

const propTypes = {
  addDocumentToVariance: PropTypes.func.isRequired,
  updateVariance: PropTypes.func.isRequired,
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
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

// to parse and join params safely
export const joinOrRemove = (param, key) => {
  if (isEmpty(param)) {
    return {};
  }
  return typeof param === "string" ? { [key]: param } : { [key]: param.join(",") };
};
export const removeEmptyStings = (param, key) => (isEmpty(param) ? {} : { [key]: param });
export const formatParams = ({
  region = [],
  compliance_code = [],
  variance_application_status_code = [],
  issue_date_after,
  issue_date_before,
  expiry_date_before,
  expiry_date_after,
  search,
  major,
  ...remainingParams
}) => {
  return {
    ...joinOrRemove(region, "region"),
    ...joinOrRemove(compliance_code, "compliance_code"),
    ...joinOrRemove(variance_application_status_code, "variance_application_status_code"),
    ...removeEmptyStings(issue_date_after, "issue_date_after"),
    ...removeEmptyStings(issue_date_before, "issue_date_before"),
    ...removeEmptyStings(expiry_date_before, "expiry_date_before"),
    ...removeEmptyStings(expiry_date_after, "expiry_date_after"),
    ...removeEmptyStings(search, "search"),
    ...removeEmptyStings(major, "major"),
    ...remainingParams,
  };
};
export class VarianceHomePage extends Component {
  params = queryString.parse(this.props.location.search);

  constructor(props) {
    super(props);
    this.handleVarianceSearchDebounced = debounce(this.handleVarianceSearch, 1000);
    this.state = {
      variancesLoaded: false,
      params: {
        page: Strings.DEFAULT_PAGE,
        per_page: Strings.DEFAULT_PER_PAGE,
        compliance_code: formatParamStringToArray(this.params.compliance_code),
        variance_application_status_code: formatParamStringToArray(
          this.params.variance_application_status_code
        ),
        region: formatParamStringToArray(this.params.region),
        major: this.params.major,
        search: this.params.search,
        issue_date_after: this.params.issue_date_after,
        issue_date_before: this.params.issue_date_before,
        expiry_date_before: this.params.expiry_date_before,
        expiry_date_after: this.params.expiry_date_after,
        ...this.params,
      },
    };
  }

  componentDidMount() {
    const params = this.props.location.search;
    if (params) {
      this.renderDataFromURL(params);
    } else {
      const defaultParams = {
        page: Strings.DEFAULT_PAGE,
        per_page: Strings.DEFAULT_PER_PAGE,
      };
      this.props.history.push(router.VARIANCE_DASHBOARD.dynamicRoute(defaultParams));
    }
    this.props.fetchVariances(this.state.params).then(() => {
      this.setState({ variancesLoaded: true });
    });
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      this.renderDataFromURL(nextProps.location.search);
    }
  }

  componentWillUnmount() {
    this.handleVarianceSearchDebounced.cancel();
    this.setState({
      params: {},
    });
  }

  renderDataFromURL = (params) => {
    const {
      region,
      compliance_code,
      variance_application_status_code,
      major,
      search,
      ...remainingParams
    } = queryString.parse(params);
    this.setState(
      {
        params: {
          region: formatParamStringToArray(region),
          compliance_code: formatParamStringToArray(compliance_code),
          variance_application_status_code: formatParamStringToArray(
            variance_application_status_code
          ),
          major,
          search,
          ...remainingParams,
        },
      },
      () => {
        this.props.fetchVariances(this.state.params);
      }
    );
  };

  clearParams = () => {
    this.setState(
      {
        params: {
          region: [],
          compliance_code: [],
          variance_application_status_code: [],
          major: null,
          search: null,
          issue_date_after: null,
          issue_date_before: null,
          expiry_date_before: null,
          expiry_date_after: null,
        },
      },
      () => {
        this.props.fetchVariances(this.state.params);
      }
    );
  };

  handleVarianceSearch = (searchParams, clear = false) => {
    const formattedSearchParams = formatParams(searchParams);
    const persistedParams = clear ? {} : formatParams(this.state.params);
    this.setState((prevState) => {
      const updatedParams = {
        // Start from existing state
        ...persistedParams,
        // Overwrite prev params with any newly provided search params
        ...formattedSearchParams,
        // Reset page number
        page: prevState.params.page ? prevState.params.page : Strings.DEFAULT_PAGE,
        // Retain per_page if present
        per_page: prevState.params.per_page ? prevState.params.per_page : Strings.DEFAULT_PER_PAGE,
      };
      this.props.history.push(router.VARIANCE_DASHBOARD.dynamicRoute(updatedParams));
      return { params: updatedParams };
    });
  };

  handleVariancePageChange = (page, per_page) => {
    this.setState({ variancesLoaded: false });
    return this.setState((prevState) => {
      const params = { ...prevState.params, page, per_page };
      this.props.history.push(router.VARIANCE_DASHBOARD.dynamicRoute(formatParams(params)));
      return {
        variancesLoaded: true,
        params,
      };
    });
  };

  handleUpdateVariance = (files, variance, isApproved) => (values) => {
    // if the application isApproved, set issue_date to today and set expiry_date 5 years from today,
    // unless the user sets a custom expiry.
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
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <h1>Browse Variances</h1>
        </div>
        <div className="landing-page__content">
          <AuthorizationWrapper inTesting>
            <VarianceSearch
              handleNameFieldReset={this.handleNameFieldReset}
              initialValues={this.state.params}
              fetchVariances={this.props.fetchVariances}
              handleVarianceSearch={this.handleVarianceSearchDebounced}
              mineRegionOptions={this.props.mineRegionOptions}
              complianceCodes={this.props.getDropdownHSRCMComplianceCodes}
              filterVarianceStatusOptions={this.props.filterVarianceStatusOptions}
            />
          </AuthorizationWrapper>
          <VarianceTable
            isLoaded={this.state.variancesLoaded}
            isApplication={this.state.isApplication}
            handleFilterChange={this.handleFilterChange}
            variances={this.props.variances}
            pageData={this.props.variancePageData}
            handlePageChange={this.handleVariancePageChange}
            handleVarianceSearch={this.handleVarianceSearch}
            params={this.state.params}
            openEditVarianceModal={this.openEditVarianceModal}
            openViewVarianceModal={this.openViewVarianceModal}
            sortField={this.state.params.sort_field}
            sortDir={this.state.params.sort_dir}
          />
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
  filterVarianceStatusOptions: getFilterVarianceStatusOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchVariances,
      updateVariance,
      openModal,
      closeModal,
      addDocumentToVariance,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VarianceHomePage);

import React, { Component } from "react";
import { connect } from "react-redux";
import { uniqBy } from "lodash";
import PropTypes from "prop-types";
import { destroy } from "redux-form";
import * as Strings from "@common/constants/strings";
import queryString from "query-string";
import { fetchProjects } from "@common/actionCreators/projectActionCreator";
import {
  getCommodityOptionHash,
  getProjectSummaryStatusCodesHash,
  getInformationRequirementsTableStatusCodesHash,
  getMajorMinesApplicationStatusCodesHash,
  getDropdownProjectSummaryStatusCodes,
  getDropdownInformationRequirementsTableStatusCodes,
  getDropdownMajorMinesApplicationStatusCodes,
} from "@common/selectors/staticContentSelectors";
import { getProjects, getProjectPageData } from "@common/selectors/projectSelectors";
import { bindActionCreators } from "redux";
import * as router from "@/constants/routes";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import CustomPropTypes from "@/customPropTypes";
import MajorProjectSearch from "./MajorProjectSearch";
import MajorProjectTable from "./MajorProjectTable";

const propTypes = {
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  fetchProjects: PropTypes.func.isRequired,
  projects: PropTypes.arrayOf(CustomPropTypes.projectDashboard).isRequired,
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  informationRequirementsTableStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  majorMinesApplicationStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaryStatusCodes: PropTypes.arrayOf(PropTypes.any).isRequired,
  informationRequirementsTableStatusCodes: PropTypes.arrayOf(PropTypes.any).isRequired,
  majorMinesApplicationStatusCodes: PropTypes.arrayOf(PropTypes.any).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  pageData: CustomPropTypes.projectPageData.isRequired,
};

const defaultParams = {
  page: Strings.DEFAULT_PAGE,
  per_page: Strings.DEFAULT_PER_PAGE,
  sort_field: undefined,
  sort_dir: undefined,
  search: undefined,
  application_status: [],
  application_stage: [],
  update_timestamp: undefined,
};

export class MajorProjectHomePage extends Component {
  state = {
    projectsLoaded: false,
    listParams: defaultParams,
  };

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    this.setState(
      (prevState) => ({
        listParams: {
          ...prevState.listParams,
          ...params,
        },
      }),
      () =>
        this.props.history.replace(
          router.MAJOR_PROJECTS_DASHBOARD.dynamicRoute(this.state.listParams)
        )
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.setState({ projectsLoaded: false }, () =>
        this.renderDataFromURL(nextProps.location.search)
      );
    }
  }

  renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);
    this.props.fetchProjects(parsedParams).then(() => {
      this.setState({ projectsLoaded: true });
    });
  };

  clearParams = () => {
    this.setState(
      (prevState) => ({
        listParams: {
          ...defaultParams,
          per_page: prevState.listParams.per_page || defaultParams.per_page,
          sort_field: prevState.listParams.sort_field,
          sort_dir: prevState.listParams.sort_dir,
        },
      }),
      () => {
        this.props.history.replace(
          router.MAJOR_PROJECTS_DASHBOARD.dynamicRoute(this.state.listParams)
        );
      }
    );
  };

  onPageChange = (page, per_page) => {
    this.setState(
      (prevState) => ({ listParams: { ...prevState.listParams, page, per_page } }),
      () =>
        this.props.history.replace(
          router.MAJOR_PROJECTS_DASHBOARD.dynamicRoute(this.state.listParams)
        )
    );
  };

  handleSearch = (params) => {
    this.setState(
      {
        listParams: params,
      },
      () =>
        this.props.history.replace(
          router.MAJOR_PROJECTS_DASHBOARD.dynamicRoute(this.state.listParams)
        )
    );
  };

  render() {
    const allStatus = [].concat(
      this.props.projectSummaryStatusCodes,
      this.props.informationRequirementsTableStatusCodes,
      this.props.majorMinesApplicationStatusCodes
    );
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <div className="inline-flex between center-mobile center-mobile">
            <div>
              <h1>Major Projects</h1>
            </div>
          </div>
        </div>
        <div className="landing-page__content">
          <div className="page__content">
            <MajorProjectSearch
              initialValues={this.state.listParams}
              handleSearch={this.handleSearch}
              handleReset={this.clearParams}
              statusCodes={uniqBy(allStatus, "value").sort((a, b) => (a.value < b.value ? -1 : 1))}
            />
            <MajorProjectTable
              isLoaded={this.state.projectsLoaded}
              handleSearch={this.handleSearch}
              projects={this.props.projects}
              sortField={this.state.listParams.sort_field}
              sortDir={this.state.listParams.sort_dir}
              filters={this.state.listParams}
              defaultParams={defaultParams}
              statusCodeHash={{
                ...this.props.projectSummaryStatusCodesHash,
                ...this.props.informationRequirementsTableStatusCodesHash,
                ...this.props.majorMinesApplicationStatusCodesHash,
              }}
              mineCommodityOptionsHash={this.props.mineCommodityOptionsHash}
            />
            <div className="center">
              <ResponsivePagination
                onPageChange={this.onPageChange}
                currentPage={Number(this.state.listParams.page)}
                pageTotal={this.props.pageData?.total}
                itemsPerPage={Number(this.state.listParams.per_page)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MajorProjectHomePage.propTypes = propTypes;

const mapStateToProps = (state) => ({
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
  projectSummaryStatusCodes: getDropdownProjectSummaryStatusCodes(state),
  informationRequirementsTableStatusCodesHash: getInformationRequirementsTableStatusCodesHash(
    state
  ),
  informationRequirementsTableStatusCodes: getDropdownInformationRequirementsTableStatusCodes(
    state
  ),
  majorMinesApplicationStatusCodesHash: getMajorMinesApplicationStatusCodesHash(state),
  majorMinesApplicationStatusCodes: getDropdownMajorMinesApplicationStatusCodes(state),
  projects: getProjects(state),
  pageData: getProjectPageData(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchProjects,
      destroy,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MajorProjectHomePage);

import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import * as Strings from "@common/constants/strings";
import {
  getMineRegionHash,
  getMineRegionDropdownOptions,
  getDropdownNoticeOfWorkApplicationStatusOptions,
  getDropdownNoticeOfWorkApplicationTypeOptions,
} from "@common/selectors/staticContentSelectors";
import { fetchNoticeOfWorkApplications } from "@common/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWorkList,
  getNoticeOfWorkPageData,
} from "@common/selectors/noticeOfWorkSelectors";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import NoticeOfWorkTable from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkTable";
import NoticeOfWorkSearch from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkSearch";
import ResponsivePagination from "@/components/common/ResponsivePagination";

const propTypes = {
  fetchNoticeOfWorkApplications: PropTypes.func.isRequired,
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  pageData: CustomPropTypes.pageData.isRequired,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.importedNOWApplication).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  applicationStatusOptions: CustomPropTypes.options.isRequired,
  applicationTypeOptions: CustomPropTypes.options.isRequired,
};

const defaultParams = {
  page: Strings.DEFAULT_PAGE,
  per_page: Strings.DEFAULT_PER_PAGE,
  sort_field: "received_date",
  sort_dir: "desc",
  mine_search: undefined,
  now_number: undefined,
  mine_name: undefined,
  originating_system: [],
  lead_inspector_name: undefined,
  now_application_status_description: [],
  notice_of_work_type_description: [],
  mine_region: [],
};

export class NoticeOfWorkHomePage extends Component {
  state = {
    isLoaded: false,
    params: defaultParams,
  };

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    this.setState(
      (prevState) => ({
        params: {
          ...prevState.params,
          ...params,
        },
      }),
      () =>
        this.props.history.replace(
          routes.NOTICE_OF_WORK_APPLICATIONS.dynamicRoute(this.state.params)
        )
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.setState({ isLoaded: false }, () => this.renderDataFromURL(nextProps.location.search));
    }
  }

  renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);
    this.props.fetchNoticeOfWorkApplications(parsedParams).then(() => {
      this.setState({ isLoaded: true });
    });
  };

  onPageChange = (page, per_page) => {
    this.setState(
      (prevState) => ({ params: { ...prevState.params, page, per_page } }),
      () =>
        this.props.history.replace(
          routes.NOTICE_OF_WORK_APPLICATIONS.dynamicRoute(this.state.params)
        )
    );
  };

  handleSearch = (params) => {
    this.setState(
      {
        params: { ...params, page: defaultParams.page },
      },
      () =>
        this.props.history.replace(
          routes.NOTICE_OF_WORK_APPLICATIONS.dynamicRoute(this.state.params)
        )
    );
  };

  render() {
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <div>
            <h1>Browse Notices of Work</h1>
          </div>
        </div>
        <div className="landing-page__content">
          <div className="page__content">
            <NoticeOfWorkSearch
              handleSearch={this.handleSearch}
              searchParams={this.state.params}
              initialValues={{ mine_search: this.state.params.mine_search }}
            />
            <div>
              <div className="tab__content">
                <NoticeOfWorkTable
                  isLoaded={this.state.isLoaded}
                  handleSearch={this.handleSearch}
                  noticeOfWorkApplications={this.props.noticeOfWorkApplications}
                  sortField={this.state.params.sort_field}
                  sortDir={this.state.params.sort_dir}
                  searchParams={this.state.params}
                  defaultParams={defaultParams}
                  mineRegionHash={this.props.mineRegionHash}
                  mineRegionOptions={this.props.mineRegionOptions}
                  applicationStatusOptions={this.props.applicationStatusOptions}
                  applicationTypeOptions={this.props.applicationTypeOptions}
                />
                <div className="center">
                  <ResponsivePagination
                    onPageChange={this.onPageChange}
                    currentPage={Number(this.state.params.page)}
                    pageTotal={Number(this.props.pageData.total)}
                    itemsPerPage={Number(this.state.params.per_page)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWorkApplications: getNoticeOfWorkList(state),
  pageData: getNoticeOfWorkPageData(state),
  mineRegionHash: getMineRegionHash(state),
  mineRegionOptions: getMineRegionDropdownOptions(state),
  applicationStatusOptions: getDropdownNoticeOfWorkApplicationStatusOptions(state),
  applicationTypeOptions: getDropdownNoticeOfWorkApplicationTypeOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNoticeOfWorkApplications,
    },
    dispatch
  );

NoticeOfWorkHomePage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(NoticeOfWorkHomePage);

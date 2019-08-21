import React, { Component } from "react";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider } from "antd";
import PropTypes from "prop-types";
import queryString from "query-string";
import * as Strings from "@/constants/strings";
import * as router from "@/constants/routes";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import CustomPropTypes from "@/customPropTypes";
import { getMineRegionHash } from "@/selectors/staticContentSelectors";
import { fetchRegionOptions } from "@/actionCreators/staticContentActionCreator";
import MineNoticeOfWorkTable from "@/components/mine/NoticeOfWork/MineNoticeOfWorkTable";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { fetchNoticeOfWorkApplications } from "@/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWorkList } from "@/selectors/noticeOfWorkSelectors";
import { getMineGuid } from "@/selectors/mineSelectors";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  fetchNoticeOfWorkApplications: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.nowApplication).isRequired,
  fetchRegionOptions: PropTypes.func.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class MineNOWApplications extends Component {
  params = queryString.parse(this.props.location.search);

  state = {
    isLoaded: false,
    params: {
      page: Strings.DEFAULT_PAGE,
      per_page: Strings.DEFAULT_PER_PAGE,
      ...this.params,
    },
  };

  componentDidMount() {
    this.props.fetchRegionOptions();

    const params = this.props.location.search;
    const parsedParams = queryString.parse(params);
    const { page = this.state.params.page, per_page = this.state.params.per_page } = parsedParams;
    if (params) {
      this.renderDataFromURL();
    } else {
      this.props.history.push(
        router.MINE_NOW_APPLICATIONS.dynamicRoute(this.props.mineGuid, {
          page,
          per_page,
        })
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      this.renderDataFromURL(nextProps.location.search);
    }
  }

  componentWillUnmount() {
    this.setState({ params: {} });
  }

  renderDataFromURL = (queryParams) => {
    const params = queryParams || this.props.location.search;
    const parsedParams = queryString.parse(params);
    this.setState(
      {
        params: parsedParams,
        isLoaded: false,
      },
      () =>
        this.props.fetchNoticeOfWorkApplications(parsedParams).then(() => {
          this.setState({ isLoaded: true });
        })
    );
  };

  handleSearch = (searchParams = {}, clear = false) => {
    const persistedParams = clear ? {} : this.state.params;
    const updatedParams = {
      // Default per_page -- overwrite if provided
      per_page: Strings.DEFAULT_PER_PAGE,
      // Start from existing state
      ...persistedParams,
      // Overwrite prev params with any newly provided search params
      ...searchParams,
      // Reset page number
      page: Strings.DEFAULT_PAGE,
    };

    this.props.history.push(
      router.MINE_NOW_APPLICATIONS.dynamicRoute(this.props.mineGuid, updatedParams)
    );
    this.setState({
      params: updatedParams,
    });
  };

  render() {
    return (
      <div className="tab__content">
        <div>
          <h2>Notice of Work Applications</h2>
          <Divider />
        </div>
        <LoadingWrapper condition={this.state.isLoaded}>
          <MineNoticeOfWorkTable
            handleSearch={this.handleSearch}
            noticeOfWorkApplications={this.props.noticeOfWorkApplications}
            sortField={this.state.params.sort_field}
            sortDir={this.state.params.sort_dir}
            searchParams={this.state.params}
            mineRegionHash={this.props.mineRegionHash}
          />
        </LoadingWrapper>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineGuid: getMineGuid(state),
  noticeOfWorkApplications: getNoticeOfWorkList(state),
  mineRegionHash: getMineRegionHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNoticeOfWorkApplications,
      fetchRegionOptions,
    },
    dispatch
  );

MineNOWApplications.propTypes = propTypes;

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  AuthorizationGuard("inTesting")
)(MineNOWApplications);

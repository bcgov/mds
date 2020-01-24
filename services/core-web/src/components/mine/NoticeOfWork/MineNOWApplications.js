import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider } from "antd";
import PropTypes from "prop-types";
import queryString from "query-string";
import * as Permission from "@/constants/permissions";
import * as router from "@/constants/routes";
import AddButton from "@/components/common/AddButton";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { getMineRegionHash } from "@/selectors/staticContentSelectors";
import MineNoticeOfWorkTable from "@/components/mine/NoticeOfWork/MineNoticeOfWorkTable";
import { fetchMineNoticeOfWorkApplications } from "@/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWorkList } from "@/selectors/noticeOfWorkSelectors";
import { getMineGuid, getMines } from "@/selectors/mineSelectors";
import { formatQueryListParams } from "@/utils/helpers";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  fetchMineNoticeOfWorkApplications: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.importedNOWApplication).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class MineNOWApplications extends Component {
  params = queryString.parse(this.props.location.search);

  listQueryParams = [];

  splitListParams = formatQueryListParams("split", this.listQueryParams);

  state = {
    isLoaded: false,
    params: {
      submissions_only: true,
      ...this.params,
    },
  };

  componentDidMount() {
    const params = this.props.location.search;
    const parsedParams = queryString.parse(params);
    const {
      page = this.state.params.page,
      per_page = this.state.params.per_page,
      submissions_only = this.state.params.submissions_only,
    } = parsedParams;
    if (params) {
      this.renderDataFromURL();
    } else {
      this.props.history.push(
        router.MINE_NOW_APPLICATIONS.dynamicRoute(this.props.mineGuid, {
          page,
          per_page,
          submissions_only,
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
    this.setState({
      params: {},
    });
  }

  renderDataFromURL = (queryParams) => {
    const params = queryParams || this.props.location.search;
    const parsedParams = queryString.parse(params);
    this.setState(
      {
        params: this.splitListParams(parsedParams),
        isLoaded: false,
      },
      () =>
        this.props.fetchMineNoticeOfWorkApplications(this.props.mineGuid, parsedParams).then(() => {
          this.setState({ isLoaded: true });
        })
    );
  };

  handleSearch = (searchParams = {}, clear = false) => {
    const persistedParams = clear ? {} : this.state.params;
    const updatedParams = {
      // Start from existing state
      ...persistedParams,
      // Overwrite prev params with any newly provided search params
      ...searchParams,
      submissions_only: true,
    };

    this.props.history.push(
      router.MINE_NOW_APPLICATIONS.dynamicRoute(this.props.mineGuid, updatedParams)
    );
  };

  render() {
    return (
      <div className="tab__content">
        <div>
          <h2>Notice of Work Applications</h2>
          <AuthorizationWrapper
            permission={Permission.EDIT_PERMITS}
            isMajorMine={this.props.mines[this.props.mineGuid].major_mine_ind}
          >
            <AddButton
              onClick={() =>
                this.props.history.push(router.CREATE_NOTICE_OF_WORK_APPLICATION.route)
              }
            >
              Add a Permit Application
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <Divider />

        <MineNoticeOfWorkTable
          isLoaded={this.state.isLoaded}
          handleSearch={this.handleSearch}
          noticeOfWorkApplications={this.props.noticeOfWorkApplications}
          sortField={this.state.params.sort_field}
          sortDir={this.state.params.sort_dir}
          searchParams={this.state.params}
          mineRegionHash={this.props.mineRegionHash}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineGuid: getMineGuid(state),
  mines: getMines(state),
  noticeOfWorkApplications: getNoticeOfWorkList(state),
  mineRegionHash: getMineRegionHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNoticeOfWorkApplications,
    },
    dispatch
  );

MineNOWApplications.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineNOWApplications);

import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider } from "antd";
import PropTypes from "prop-types";
import queryString from "query-string";
import { getMineRegionHash } from "@common/selectors/staticContentSelectors";
import { fetchMineNoticeOfWorkApplications } from "@common/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWorkList } from "@common/selectors/noticeOfWorkSelectors";
import { getMineGuid, getMines } from "@common/selectors/mineSelectors";
import { formatQueryListParams } from "@common/utils/helpers";
import * as router from "@/constants/routes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/AddButton";
import CustomPropTypes from "@/customPropTypes";
import MineNoticeOfWorkTable from "@/components/mine/NoticeOfWork/MineNoticeOfWorkTable";

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
    // for the time being, set submissions_only to true if a regional mine, false if a major mine
    const submissionsOnly = !this.props.mines[this.props.mineGuid].major_mine_ind;
    const {
      page = this.state.params.page,
      per_page = this.state.params.per_page,
      submissions_only = submissionsOnly,
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
        this.props
          .fetchMineNoticeOfWorkApplications({ mine_guid: this.props.mineGuid, ...parsedParams })
          .then(() => {
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
    const isMajorMine = this.props.mines[this.props.mineGuid].major_mine_ind;
    const title = isMajorMine ? "Permit Applications" : "Notice of Work Applications";
    return (
      <div className="tab__content">
        <div>
          <h2>{title}</h2>
          <AuthorizationWrapper isMajorMine={isMajorMine} permission={Permission.EDIT_PERMITS}>
            <AddButton
              onClick={() =>
                this.props.history.push(router.CREATE_NOTICE_OF_WORK_APPLICATION.route, {
                  mineGuid: this.props.mineGuid,
                })
              }
            >
              Add a Permit Application
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <Divider />

        <MineNoticeOfWorkTable
          isMajorMine={isMajorMine}
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

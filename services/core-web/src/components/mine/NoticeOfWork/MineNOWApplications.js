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
import MineAdministrativeAmendmentTable from "@/components/mine/AdministrativeAmendment/MineAdministrativeAmendmentTable";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  fetchMineNoticeOfWorkApplications: PropTypes.func.isRequired,
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
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
      ...this.params,
    },
    expandedRowKeys: [],
  };

  componentDidMount() {
    const params = this.props.location.search;
    const parsedParams = queryString.parse(params);
    const { page = this.state.params.page, per_page = this.state.params.per_page } = parsedParams;
    if (params) {
      this.renderDataFromURL();
    } else {
      this.props.history.replace(
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

  onExpand = (expanded, record) =>
    this.setState((prevState) => {
      const expandedRowKeys = expanded
        ? prevState.expandedRowKeys.concat(record.key)
        : prevState.expandedRowKeys.filter((key) => key !== record.key);
      return { expandedRowKeys };
    });

  handleSearch = (searchParams = {}, clear = false) => {
    const persistedParams = clear ? {} : this.state.params;
    const updatedParams = {
      // Start from existing state
      ...persistedParams,
      // Overwrite prev params with any newly provided search params
      ...searchParams,
    };

    this.props.history.replace(
      router.MINE_NOW_APPLICATIONS.dynamicRoute(this.props.mineGuid, updatedParams)
    );
  };

  render() {
    const isMajorMine = this.props.mines[this.props.mineGuid].major_mine_ind;
    const type = isMajorMine ? "Permit Application" : "Notice of Work Application";
    return (
      <div className="tab__content">
        <div>
          <h2>{type}s</h2>
          <AuthorizationWrapper isMajorMine={isMajorMine} permission={Permission.EDIT_PERMITS}>
            <AddButton
              onClick={() =>
                this.props.history.replace(router.CREATE_NOTICE_OF_WORK_APPLICATION.route, {
                  mineGuid: this.props.mineGuid,
                })
              }
            >
              Add a {type}
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <Divider />
        <MineNoticeOfWorkTable
          isMajorMine={isMajorMine}
          isLoaded={this.state.isLoaded}
          handleSearch={this.handleSearch}
          noticeOfWorkApplications={this.props.noticeOfWorkApplications.filter(
            (app) => app.application_type_code === "NOW"
          )}
          sortField={this.state.params.sort_field}
          sortDir={this.state.params.sort_dir}
          searchParams={this.state.params}
          mineRegionHash={this.props.mineRegionHash}
        />
        <br />
        <div>
          <h2>Administrative Amendments</h2>
          <AuthorizationWrapper isMajorMine={isMajorMine} permission={Permission.EDIT_PERMITS}>
            {/* // eslint-disable-next-line no-alert */}
            <AddButton onClick={() => alert("Create Admin Amendment")}>
              Add a Administrative Amendments
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <MineAdministrativeAmendmentTable
          isMajorMine={isMajorMine}
          isLoaded={this.state.isLoaded}
          handleSearch={this.handleSearch}
          administrativeAmendmentApplications={this.props.noticeOfWorkApplications.filter(
            (app) => app.application_type_code === "ADA"
          )}
          sortField={this.state.params.sort_field}
          sortDir={this.state.params.sort_dir}
          searchParams={this.state.params}
          onExpand={this.onExpand}
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

export default connect(mapStateToProps, mapDispatchToProps)(MineNOWApplications);

import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider } from "antd";
import PropTypes from "prop-types";
import queryString from "query-string";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import { getMineRegionHash } from "@/selectors/staticContentSelectors";
import { fetchRegionOptions } from "@/actionCreators/staticContentActionCreator";
import MineNoticeOfWorkTable from "@/components/mine/NoticeOfWork/MineNoticeOfWorkTable";
import { fetchMineNoticeOfWorkSubmissions } from "@/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWorkList } from "@/selectors/noticeOfWorkSelectors";
import { getMineGuid } from "@/selectors/mineSelectors";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  fetchMineNoticeOfWorkSubmissions: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  noticeOfWorkSubmissions: PropTypes.arrayOf(CustomPropTypes.nowApplication).isRequired,
  fetchRegionOptions: PropTypes.func.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class MineNOWApplications extends Component {
  params = queryString.parse(this.props.location.search);

  state = {
    isLoaded: false,
    params: {
      ...this.params,
    },
  };

  componentDidMount() {
    this.props.fetchRegionOptions();
    this.renderDataFromURL();
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
        this.props.fetchMineNoticeOfWorkSubmissions(this.props.mineGuid, parsedParams).then(() => {
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
        <MineNoticeOfWorkTable
          isLoaded={this.state.isLoaded}
          handleSearch={this.handleSearch}
          noticeOfWorkSubmissions={this.props.noticeOfWorkSubmissions}
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
  noticeOfWorkSubmissions: getNoticeOfWorkList(state),
  mineRegionHash: getMineRegionHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNoticeOfWorkSubmissions,
      fetchRegionOptions,
    },
    dispatch
  );

MineNOWApplications.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineNOWApplications);

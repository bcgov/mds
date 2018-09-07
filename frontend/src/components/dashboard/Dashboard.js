/**
 * @class Dasboard is the main landing page of the application, currently containts a list of viewable mines and the ability to add a new mine.
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Pagination } from 'antd';
import queryString from 'query-string'

import { getMineRecords, getMineNameList, createMineRecord } from '@/actionCreators/mineActionCreator';
import { getMines, getMineIds, getMineNames, getMinesPageData } from '@/selectors/mineSelectors';
import MineList from '@/components/dashboard/MineList';
import MineSearch from '@/components/dashboard/MineSearch';
import CreateMine from '@/components/dashboard/CreateMine';
import * as router from '@/constants/routes';
import { NO_MINE } from '@/constants/assets';
import NullScreen from '@/components/reusables/NullScreen';
import Loading from '@/components/reusables/Loading';

const propTypes = {
  getMineRecords: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  history: PropTypes.shape({push: PropTypes.func }).isRequired,
  createMineRecord: PropTypes.func,
  mines: PropTypes.object.isRequired,
  mineIds: PropTypes.array.isRequired,
  pageData: PropTypes.object.isRequired,
};

const defaultProps = {
  mines: {},
  mineIds: [],
  pageData: {}
};

export class Dashboard extends Component {
  state = {mineList: false}

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    if (params.page && params.per_page) {
      this.props.getMineRecords(params.page, params.per_page).then(() => {
        this.setState({mineList: true})
      });
    } else {
      this.props.getMineRecords('1', '25').then(() => {
        this.setState({ mineList: true })
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;

    if (locationChanged) {
      const params = queryString.parse(nextProps.location.search);
      this.props.getMineRecords(params.page, params.per_page);
    }
  }

  onPageChange = (current, pageSize) => {
    this.props.history.push(router.MINE_DASHBOARD.dynamicRoute(current, pageSize))
  }

  renderCorrectView(){
    const params = queryString.parse(this.props.location.search);
    const pageNumber = params.page ? Number(params.page) : 1;
    const perPageNumber = params.per_page ? Number(params.per_page) : 25;
    if (this.state.mineList) {
      if (this.props.mineIds.length === 0) {
        return (
          <NullScreen primaryMessage="No data found at this time" secondaryMessage="Please try again later" img={NO_MINE} />
        )
      } else {
        return (
          <div>
            <MineSearch mineNameList={this.props.mineNameList} />
            <MineList mines={this.props.mines} mineIds={this.props.mineIds} pageData={this.props.pageData} />
            <div className="center">
              <Pagination
                showSizeChanger
                onShowSizeChange={this.onPageChange}
                onChange={this.onPageChange}
                defaultCurrent={pageNumber}
                current={pageNumber}
                total={this.props.pageData.total}
                pageSizeOptions={['25', '50', '75', '100']}
                pageSize={perPageNumber}
                showTotal={total => `${total} Results`}
              />
            </div>
          </div>
        )
      }

    } else {
      return(<Loading />)
    }
  }

  render() {
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <CreateMine
            createMineRecord={this.props.createMineRecord}
            getMineRecords={this.props.getMineRecords}
            location={this.props.location}
          />
        </div>
        <div className="landing-page__content">
          {this.renderCorrectView()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    mines: getMines(state),
    mineIds: getMineIds(state),
    pageData: getMinesPageData(state)
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getMineRecords,
    createMineRecord,
  }, dispatch);
};

Dashboard.propTypes = propTypes;
Dashboard.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

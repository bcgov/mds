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

const propTypes = {
  getMineRecords: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  history: PropTypes.shape({push: PropTypes.func }).isRequired,
  getMineNameList: PropTypes.func.isRequired,
  createMineRecord: PropTypes.func,
  mines: PropTypes.object.isRequired,
  mineIds: PropTypes.array.isRequired,
  mineNameList: PropTypes.array.isRequired,
  pageData: PropTypes.object.isRequired,
};

const defaultProps = {
  mines: {},
  mineIds: [],
  mineNameList: [],
  pageData: {}
};

export class Dashboard extends Component {
 
  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    if (params.page && params.per_page) {
      this.props.getMineRecords(params.page, params.per_page);
    } else {
      this.props.getMineRecords('1', '5');
    }
    this.props.getMineNameList();
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

  render() {
    const params = queryString.parse(this.props.location.search);
    const pageNumber = params.page ? Number(params.page) : 1;
    const perPageNumber = params.per_page ? Number(params.per_page) : 5;
    return (
      <div>
        <CreateMine createMineRecord={this.props.createMineRecord}/>
        <MineSearch mineNameList={this.props.mineNameList} />
        <MineList mines={this.props.mines} mineIds={this.props.mineIds} pageData={this.props.pageData}/>
        <Pagination 
          showSizeChanger 
          onShowSizeChange={this.onPageChange} 
          onChange={this.onPageChange} 
          defaultCurrent={pageNumber} 
          current={pageNumber}
          total={this.props.pageData.total} 
          pageSizeOptions={['5', '15', '25', '50']} 
          pageSize={perPageNumber}
          showTotal={total => `${total} Results`}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    mines: getMines(state),
    mineIds: getMineIds(state),
    mineNameList: getMineNames(state).mines,
    pageData: getMinesPageData(state)
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getMineRecords,
    getMineNameList,
    createMineRecord,
  }, dispatch);
};

Dashboard.propTypes = propTypes;
Dashboard.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

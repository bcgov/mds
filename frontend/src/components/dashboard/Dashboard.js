/**
 * @className Dasboard is the main landing page of the application, currently containts a List and Map View, ability to create a new mine, and search for a mine by name or lat/long.
 * 
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Pagination, Tabs, Col, Row, Divider } from 'antd';
import queryString from 'query-string'

import { getMineRecords, createMineRecord } from '@/actionCreators/mineActionCreator';
import { getMines, getMineIds, getMinesPageData } from '@/selectors/mineSelectors';
import MineList from '@/components/dashboard/ListTab/MineList';
import MineSearch from '@/components/dashboard/ListTab/MineSearch';
import SearchCoordinatesForm from '@/components/mine/Forms/SearchCoordinatesForm';
import CreateMine from '@/components/dashboard/CreateMine';
import * as router from '@/constants/routes';
import { NO_MINE } from '@/constants/assets';
import NullScreen from '@/components/reusables/NullScreen';
import Loading from '@/components/reusables/Loading';
import MineMap from '@/components/maps/MineMap';

const TabPane = Tabs.TabPane;

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
  state = { mineList: false, lat: 53.7267, long: -127.6476}
 
  componentDidMount() {
    const params = queryString.parse(this.props.location.search); 
    this.renderDataFromURL(params);
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      const params = queryString.parse(nextProps.location.search); 
      this.renderDataFromURL(params);
    }
  }

  renderDataFromURL = (params) => {
    if (params.page && params.per_page) {
      this.props.getMineRecords(params.page, params.per_page, params.map).then(() => {
        this.setState({ mineList: true })
      });
    } else {
      this.props.getMineRecords('1', '25', params.map).then(() => {
        this.setState({ mineList: true })
      });
    }
  }

  onPageChange = (current, pageSize) => {
    this.props.history.push(router.MINE_DASHBOARD.dynamicRoute(current, pageSize))
  }

  /** 
   * @param value = {latitude: '', longitude: ''} || 'longitude, latitude';
   */
  handleCoordinateSearch = (value) => {
    if (typeof value === 'string') {
      const newVal = value.split(",");
      this.setState({ lat: Number(newVal[1]), long: Number(newVal[0]) })
    } else {
      this.setState({lat: Number(value.latitude), long: Number(value.longitude)})
    }
  }

  handleTabChange = (key) => {
    const params = queryString.parse(this.props.location.search);
    if (key === 'map' ) {
      this.setState({ mineList: false })
      this.props.history.push(router.MINE_DASHBOARD.relativeRoute(params.page, params.per_page))
    } else {
      this.setState({ mineList: false })
      this.props.history.push(router.MINE_DASHBOARD.dynamicRoute(params.page, params.per_page))
    }
  }

  renderCorrectView(){
    const params = queryString.parse(this.props.location.search);
    const pageNumber = params.page ? Number(params.page) : 1;
    const perPageNumber = params.per_page ? Number(params.per_page) : 25;
    const isMap = params.map ? 'map' : 'list';
    if (this.state.mineList) {
      if (this.props.mineIds.length === 0) {
        return (
          <NullScreen primaryMessage="No data found at this time" secondaryMessage="Please try again later" img={NO_MINE} />
        )
      } else {
        return (
          <div>
            <Tabs
              activeKey={isMap}
              size='large'
              animated={{ inkBar: true, tabPane: false }}
              onTabClick={this.handleTabChange}
            >
              <TabPane tab="List" key="list">
                <div className="center">
                  <MineSearch/>
                </div>
                <MineList 
                  mines={this.props.mines} 
                  mineIds={this.props.mineIds} 
                  pageData={this.props.pageData} 
                />
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
              </TabPane>
              <TabPane tab="Map" key="map">
                <div className="landing-page__content--search">
                  <Col span={10}><MineSearch handleCoordinateSearch={this.handleCoordinateSearch} isMapView={true}/></Col>
                  <Col span={2}>
                  <div className="center">
                    <Divider type="vertical"/>
                    <h2>OR</h2>
                    <Divider type="vertical"/>
                    </div>
                  </Col>
                  <Col span={10}><SearchCoordinatesForm onSubmit={this.handleCoordinateSearch} /></Col>
                  </div>
                <MineMap {...this.state} />
              </TabPane>
            </Tabs>
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

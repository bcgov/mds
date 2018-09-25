/**
 * @className Dasboard is the main landing page of the application, currently containts a List and Map View, ability to create a new mine, and search for a mine by name or lat/long.
 *
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Pagination, Tabs, Col, Row, Divider, notification } from 'antd';
import queryString from 'query-string'

import { getMineRecords, createMineRecord } from '@/actionCreators/mineActionCreator';
import { getMines, getMineIds, getMinesPageData } from '@/selectors/mineSelectors';
import MineList from '@/components/dashboard/MineList';
import MineSearch from '@/components/dashboard/MineSearch';
import SearchCoordinatesForm from '@/components/Forms/SearchCoordinatesForm';
import CreateMine from '@/components/dashboard/CreateMine';
import * as router from '@/constants/routes';
import NullScreen from '@/components/common/NullScreen';
import Loading from '@/components/common/Loading';
import MediaQuery from 'react-responsive';
import MineMap from '@/components/maps/MineMap';
import * as String from '@/constants/strings';

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
  state = { mineList: false, lat: String.DEFAULT_LAT, long: String.DEFAULT_LONG, showCoordinates: false, mineName: null}
 
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
      this.props.getMineRecords(String.DEFAULT_PAGE, String.DEFAULT_PER_PAGE, params.map).then(() => {
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
      if (newVal[0] && newVal[1]) {
        this.setState({ lat: Number(newVal[1]), long: Number(newVal[0]), showCoordinates: true, mineName: newVal[2] })
      } else {
        this.setState({ lat: String.DEFAULT_LAT, long: String.DEFAULT_LONG, showCoordinates: false })
        notification.error({ message: String.NO_COORDINATES, duration: 10 });
      }
    } else {
      this.setState({ lat: Number(value.latitude), long: Number(value.longitude), showCoordinates: true, mineName: null})
    }
  }

  handleTabChange = (key) => {
    const params = queryString.parse(this.props.location.search);
    if (key === 'map' ) {
      if (!params.page && !params.per_page) {
        this.setState({ mineList: false, showCoordinates: false, mineName: '' })
        this.props.history.push(router.MINE_DASHBOARD.relativeRoute(String.DEFAULT_PAGE, String.DEFAULT_PER_PAGE))
    } else {
      this.setState({ mineList: false, showCoordinates: false, mineName: '' })
      this.props.history.push(router.MINE_DASHBOARD.relativeRoute(params.page, params.per_page))
      }
    } else {
      this.setState({ mineList: false, showCoordinates: false, mineName: '' })
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
          <NullScreen type="dashboard" />
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
                <Row>
                  <Col md={{span: 12, offset: 6}} xs={{span: 20, offset: 2}}>
                    <MineSearch/>
                  </Col>
                </Row>
                <MineList 
                  mines={this.props.mines} 
                  mineIds={this.props.mineIds} 
                  pageData={this.props.pageData} 
                />
                <div className="center">
                  <MediaQuery maxWidth={500}>
                    <Pagination
                      size="small"
                      showSizeChanger
                      onShowSizeChange={this.onPageChange}
                      onChange={this.onPageChange}
                      defaultCurrent={pageNumber}
                      current={pageNumber}
                      total={this.props.pageData.total}
                      pageSizeOptions={['25', '50', '75', '100']}
                      pageSize={perPageNumber}
                    />
                  </MediaQuery>
                  <MediaQuery minWidth={501}>
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
                  </MediaQuery>
                </div>
              </TabPane>
              <TabPane tab="Map" key="map">
                <div className="landing-page__content--search">
                  <Col md={10} xs={24}>
                    <MineSearch handleCoordinateSearch={this.handleCoordinateSearch} isMapView={true}/>
                  </Col>
                  <Col md={2} sm={0} xs={0}>
                    <div className="center">
                      <Divider type="vertical"/>
                      <h2>OR</h2>
                      <Divider type="vertical"/>
                    </div>
                  </Col>
                  <Col md={0} sm={24} xs={24}>
                    <div className="center">
                      <Divider >
                      <h2>OR</h2>
                      </Divider>
                    </div>
                  </Col>
                  <Col md={10} xs={24}>
                    <SearchCoordinatesForm onSubmit={this.handleCoordinateSearch} />
                  </Col>
                </div>
                { this.state.mineName &&
                  <div className="center center-mobile">
                    <h2>Results for: <span className="p">{this.state.mineName}</span></h2>
                  </div>
                }
                {this.state.showCoordinates  && 
                  <div className="center">
                    <div className="inline-flex evenly center-mobile">
                    <h2>Latitude: <span className="p">{this.state.lat}</span></h2>
                    <h2>Longitude: <span className="p">{this.state.long}</span></h2> 
                    </div>
                  </div>
                }
                <div className="landing-page__content map">
                  <MineMap {...this.state} />
                </div>
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

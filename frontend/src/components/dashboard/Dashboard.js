import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Pagination, Tabs, Col, Row, Divider, notification } from 'antd';
import queryString from 'query-string'
import MediaQuery from 'react-responsive';
import { openModal, closeModal } from '@/actions/modalActions';
import { fetchMineRecords, createMineRecord,  fetchStatusOptions, fetchRegionOptions } from '@/actionCreators/mineActionCreator';
import { getMines, getMineIds, getMineRegionHash, getMinesPageData, getMineStatusOptions, getMineRegionOptions } from '@/selectors/mineSelectors';
import MineList from '@/components/dashboard/MineList';
import MineSearch from '@/components/dashboard/MineSearch';
import SearchCoordinatesForm from '@/components/Forms/SearchCoordinatesForm';
import { modalConfig } from '@/components/modalContent/config';
import { ConditionalButton } from '@/components/common/ConditionalButton';
import * as router from '@/constants/routes';
import Loading from '@/components/common/Loading';
import MineMap from '@/components/maps/MineMap';
import * as String from '@/constants/strings';
import * as ModalContent from '@/constants/modalContent';
import  { debounce } from 'lodash';

/**
 * @class Dasboard is the main landing page of the application, currently containts a List and Map View, ability to create a new mine, and search for a mine by name or lat/long.
 *
 */
const TabPane = Tabs.TabPane;

const propTypes = {
  fetchMineRecords: PropTypes.func.isRequired,
  createMineRecord: PropTypes.func.isRequired,
  fetchStatusOptions: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  history: PropTypes.shape({push: PropTypes.func }).isRequired,
  mines: PropTypes.object.isRequired,
  mineIds: PropTypes.array.isRequired,
  pageData: PropTypes.object.isRequired,
  mineStatusOptions: PropTypes.array.isRequired,
  mineRegionOptions: PropTypes.array.isRequired,
};

const defaultProps = {
  mines: {},
  mineIds: [],
  pageData: {},
  mineStatusOptions: [],
  mineRegionOptions: [],
};

export class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.handleMineSearchDebounced = debounce(this.handleMineSearch, 1000);
    this.state = { 
      mineList: false, 
      lat: String.DEFAULT_LAT, 
      long: String.DEFAULT_LONG, 
      showCoordinates: false, 
      mineName: null, 
      params: {
        page: String.DEFAULT_PAGE,
        per_page: String.DEFAULT_PER_PAGE,
      },
    }
  }

  componentDidMount() {
    const params = this.props.location.search;
    if (params) {
      this.renderDataFromURL(params);
    } else {
      this.props.history.push(router.MINE_DASHBOARD.dynamicRoute(String.DEFAULT_PAGE, String.DEFAULT_PER_PAGE));
    }
    this.props.fetchStatusOptions();
    this.props.fetchRegionOptions();
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      const params = nextProps.location.search;
      this.setState({ mineList: false });
      this.renderDataFromURL(params);
    }
  }

  componentWillUnmount() {
    this.handleMineSearchDebounced.cancel();
    this.setState({ params: {} });
  }

  renderDataFromURL = (params) => {
    const paramsObj = queryString.parse(params);
    this.setState({ params: paramsObj });
    this.props.fetchMineRecords(params).then(() => {
      this.setState({ mineList: true });
    });
  }

  onPageChange = (current, pageSize) => {
    this.props.history.push(router.MINE_DASHBOARD.dynamicRoute(current, pageSize, this.state.params.search));
  }

  /*
   * @param value = {latitude: '', longitude: ''} || 'longitude, latitude';
   */
  handleCoordinateSearch = (value) => {
    if (typeof value === 'string') {
      const newVal = value.split(",");
      if (newVal[0] && newVal[1]) {
        this.setState({ lat: Number(newVal[1]), long: Number(newVal[0]), showCoordinates: true, mineName: newVal[2] });
      } else {
        this.setState({ lat: String.DEFAULT_LAT, long: String.DEFAULT_LONG, showCoordinates: false });
        notification.error({ message: String.NO_COORDINATES, duration: 10 });
      }
    } else {
      this.setState({ lat: Number(value.latitude), long: Number(value.longitude), showCoordinates: true, mineName: null});
    }
  }

  handleTabChange = (key) => {
    const { page, per_page, search } = this.state.params;
    this.setState({ mineList: false, showCoordinates: false, mineName: '' });
    if (key === 'map' ) {
      this.props.history.push(router.MINE_DASHBOARD.mapRoute(page, per_page, search));
    } else {
      this.props.history.push(router.MINE_DASHBOARD.dynamicRoute(page, per_page, search));
    }
  }

  handleMineSearch = (value) => {
    const perPage = this.state.params.per_page ? this.state.params.per_page : String.DEFAULT_PER_PAGE;
    //reset page when a search is initiated
    this.props.history.push(router.MINE_DASHBOARD.dynamicRoute(String.DEFAULT_PAGE, perPage, value));
  }

  handleSubmit = (value) => {
    let mineStatus = value.mine_status.join(",");
    this.props.createMineRecord({...value, mine_status: mineStatus}).then(() => {
      this.props.closeModal();
    }).then(() => {
      const params = this.props.location.search;
      this.props.fetchMineRecords(params);
    });
  }

  openModal(event, mineStatusOptions, mineRegionOptions, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { mineStatusOptions, mineRegionOptions, onSubmit, title },
      content: modalConfig.MINE_RECORD
    });
  }

  renderCorrectView(){
    const { search, map, page, per_page } = this.state.params;
    const currentPage = Number(page);
    const pageTotal = Number(this.props.pageData.total);
    const itemsPerPage = Number(per_page);
    const isMap = map ? 'map' : 'list';
    if (this.state.mineList) {
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
                    <MineSearch handleMineSearch={this.handleMineSearchDebounced} searchValue={search}/>
                  </Col>
                </Row>
                <div className="tab__content">
                  <MineList {...this.props} />
                </div>
                <div className="center">
                  <MediaQuery maxWidth={500}>
                    <Pagination
                      size="small"
                      showSizeChanger
                      onShowSizeChange={this.onPageChange}
                      onChange={this.onPageChange}
                      defaultCurrent={currentPage}
                      current={currentPage}
                      total={pageTotal}
                      pageSizeOptions={['25', '50', '75', '100']}
                      pageSize={itemsPerPage}
                    />
                  </MediaQuery>
                  <MediaQuery minWidth={501}>
                    <Pagination
                      showSizeChanger
                      onShowSizeChange={this.onPageChange}
                      onChange={this.onPageChange}
                      defaultCurrent={currentPage}
                      current={currentPage}
                      total={pageTotal}
                      pageSizeOptions={['25', '50', '75', '100']}
                      pageSize={itemsPerPage}
                      showTotal={total => `${total} Results`}
                    />
                  </MediaQuery>
                </div>
              </TabPane>
              <TabPane tab="Map" key="map">
                <div className="landing-page__content--search">
                  <Col md={10} xs={24}>
                    <MineSearch handleCoordinateSearch={this.handleCoordinateSearch} isMapView/>
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
                <div>
                  <MineMap {...this.state} />
                </div>
              </TabPane>
            </Tabs>
          </div>
        )
      } else {
      return(<Loading />)
    }
  }

  render() {
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <div className="right center-mobile">
          <ConditionalButton
            className="full-mobile"
            type="primary"
            handleAction={(event) => this.openModal(event, this.props.mineStatusOptions, this.props.mineRegionOptions, this.handleSubmit, ModalContent.CREATE_MINE_RECORD)}
            string={ModalContent.CREATE_MINE_RECORD}
          />
          </div>
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
    pageData: getMinesPageData(state),
    mineStatusOptions: getMineStatusOptions(state),
    mineRegionOptions: getMineRegionOptions(state),
    mineRegionHash: getMineRegionHash(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    fetchMineRecords,
    fetchStatusOptions,
    fetchRegionOptions,
    createMineRecord,
    openModal,
    closeModal,
  }, dispatch);
};

Dashboard.propTypes = propTypes;
Dashboard.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

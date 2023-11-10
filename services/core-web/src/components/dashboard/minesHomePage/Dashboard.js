import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Element, scroller } from "react-scroll";
import PropTypes from "prop-types";
import { Tabs, Col, Divider, notification, Card } from "antd";
import queryString from "query-string";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  fetchMineRecords,
  createMineRecord,
  createMineTypes,
  fetchMineRecordsForMap,
  fetchMineRecordById,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import {
  getMines,
  getMinesPageData,
  getTransformedMineTypes,
} from "@mds/common/redux/selectors/mineSelectors";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getCommodityOptionHash,
  getDisturbanceOptionHash,
  getMineStatusDropDownOptions,
  getMineRegionDropdownOptions,
  getMineTenureTypeDropdownOptions,
  getDropdownCommodityOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import * as Strings from "@common/constants/strings";
import { PageTracker } from "@common/utils/trackers";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import CustomPropTypes from "@/customPropTypes";
import MineList from "@/components/dashboard/minesHomePage/MineList";
import MineSearch from "@/components/dashboard/minesHomePage/MineSearch";
import SearchCoordinatesForm from "@/components/Forms/SearchCoordinatesForm";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as router from "@/constants/routes";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import MineMapLeaflet from "@/components/maps/MineMapLeaflet";
import * as Permission from "@/constants/permissions";
import * as ModalContent from "@/constants/modalContent";
import AddButton from "@/components/common/buttons/AddButton";

/**
 * @class Dashboard is the main landing page of the application, currently contains a List and Map View, ability to create a new mine, and search for a mine by name or lat/long.
 */

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchMineRecords: PropTypes.func.isRequired,
  fetchMineRecordsForMap: PropTypes.func.isRequired,
  createMineRecord: PropTypes.func.isRequired,
  createMineTypes: PropTypes.func.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineDisturbanceOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  pageData: CustomPropTypes.minePageData.isRequired,
  transformedMineTypes: CustomPropTypes.transformedMineTypes,
};

const defaultProps = {
  transformedMineTypes: {},
};

const defaultListParams = {
  page: Strings.DEFAULT_PAGE,
  per_page: Strings.DEFAULT_PER_PAGE,
  sort_field: undefined,
  sort_dir: undefined,
  search: undefined,
  status: [],
  region: [],
  tenure: [],
  commodity: [],
  work_status: [],
  major: undefined,
  tsf: undefined,
  verified: undefined,
};

export class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isListLoaded: false,
      isMapLoaded: false,
      showMapSearchInfo: false,
      listParams: defaultListParams,
      mapParams: {
        lat: Strings.DEFAULT_LAT,
        long: Strings.DEFAULT_LONG,
        mineName: null,
        zoom: Strings.DEFAULT_ZOOM,
      },
      mineGuid: null,
      allowMapAutoScroll: false,
    };
  }

  componentDidMount() {
    const { map, ...params } = queryString.parse(this.props.location.search);
    if (map) {
      this.setState(
        {
          mapParams: {
            lat: Number(params.lat) || Strings.DEFAULT_LAT,
            long: Number(params.long) || Strings.DEFAULT_LONG,
            mineName: params.mineName || null,
            zoom: Number(params.zoom) || Strings.DEFAULT_ZOOM,
          },
        },
        () => this.props.history.push(router.MINE_HOME_PAGE.mapRoute(this.state.mapParams))
      );
    } else {
      this.setState(
        (prevState) => ({
          listParams: {
            ...prevState.listParams,
            ...params,
          },
        }),
        () => this.props.history.push(router.MINE_HOME_PAGE.dynamicRoute(this.state.listParams))
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.setState({ isListLoaded: false, isMapLoaded: false }, () =>
        this.renderDataFromURL(nextProps.location.search)
      );
    }
  }

  renderDataFromURL = (params) => {
    const { map, lat, long } = queryString.parse(params);
    if (map) {
      this.props.fetchMineRecordsForMap().then(() => {
        this.setState({ isMapLoaded: true });
        if (lat && long) {
          this.setState({ showMapSearchInfo: true });
          if (this.state.allowMapAutoScroll) {
            this.handleScroll("mapElement", -60);
          }
        }
      });
    } else {
      this.props.fetchMineRecords(params).then(() => {
        this.setState({ isListLoaded: true });
      });
    }
  };

  onPageChange = (page, per_page) => {
    this.setState(
      (prevState) => ({ listParams: { ...prevState.listParams, page, per_page } }),
      () => this.props.history.push(router.MINE_HOME_PAGE.dynamicRoute(this.state.listParams))
    );
  };

  handleMapViewSearchByName = (value) => {
    const { latitude, longitude, mine_name, mine_guid } = JSON.parse(value);
    if (latitude && longitude) {
      this.setState(
        {
          mapParams: {
            lat: Number(latitude),
            long: Number(longitude),
            mineName: mine_name,
            zoom: Strings.HIGH_ZOOM,
          },
          mineGuid: mine_guid,
          allowMapAutoScroll: true,
        },
        () => this.props.history.push(router.MINE_HOME_PAGE.mapRoute(this.state.mapParams))
      );
    } else {
      notification.error({ message: Strings.NO_COORDINATES, duration: 10 });
    }
  };

  handleMapViewSearchByCoordinate = (value) => {
    this.setState(
      {
        mapParams: {
          lat: Number(value.latitude),
          long: Number(value.longitude),
          mineName: null,
          zoom: Strings.HIGH_ZOOM,
        },
        mineGuid: null,
        allowMapAutoScroll: true,
      },
      () => this.props.history.push(router.MINE_HOME_PAGE.mapRoute(this.state.mapParams))
    );
  };

  handleScroll = (element, offset = 0) => {
    scroller.scrollTo(element, {
      duration: 1000,
      smooth: true,
      isDynamic: true,
      offset,
    });
  };

  handleTabChange = (key) => {
    this.setState({
      isListLoaded: false,
      isMapLoaded: false,
      allowMapAutoScroll: false,
    });

    if (key === "map") {
      this.props.history.push(router.MINE_HOME_PAGE.mapRoute(this.state.mapParams));
    } else {
      this.props.history.push(router.MINE_HOME_PAGE.dynamicRoute(this.state.listParams));
    }
  };

  handleListViewSearch = (params) => {
    this.setState(
      {
        listParams: params,
      },
      () => this.props.history.push(router.MINE_HOME_PAGE.dynamicRoute(this.state.listParams))
    );
  };

  handleListViewReset = () => {
    this.setState(
      (prevState) => ({
        listParams: {
          ...defaultListParams,
          // page: prevState.listParams.page || defaultListParams.page,
          per_page: prevState.listParams.per_page || defaultListParams.per_page,
          sort_field: prevState.listParams.sort_field,
          sort_dir: prevState.listParams.sort_dir,
        },
      }),
      () => this.props.history.push(router.MINE_HOME_PAGE.dynamicRoute(this.state.listParams))
    );
  };

  handleCreateMineRecordSubmit = (value) => {
    const mineStatus = value.mine_status.join(",");
    return this.props.createMineRecord({ ...value, mine_status: mineStatus }).then((response) => {
      this.props.createMineTypes(response.data.mine_guid, value.mine_types).then(() => {
        this.props.closeModal();
        const params = this.props.location.search;
        this.props.fetchMineRecords(params);
      });
    });
  };

  openCreateMineRecordModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: {
        handleDelete: () => {},
        onSubmit,
        title,
        isNewRecord: true,
      },
      content: modalConfig.MINE_RECORD,
    });
  }

  renderCorrectView() {
    const { map } = queryString.parse(this.props.location.search);
    return (
      <div>
        <PageTracker title="Mines Page" />
        <Tabs
          activeKey={map ? "map" : "list"}
          size="large"
          animated={{ inkBar: false, tabPane: false }}
          onTabClick={this.handleTabChange}
          centered
        >
          <Tabs.TabPane tab="List" key="list">
            <MineSearch
              initialValues={this.state.listParams}
              handleSearch={this.handleListViewSearch}
              handleReset={this.handleListViewReset}
              searchValue={this.state.listParams.search}
              {...this.props}
            />
            <div>
              <div className="tab__content">
                <MineList
                  isLoaded={this.state.isListLoaded}
                  mines={this.props.mines}
                  mineRegionHash={this.props.mineRegionHash}
                  mineTenureHash={this.props.mineTenureHash}
                  mineCommodityOptionsHash={this.props.mineCommodityOptionsHash}
                  handleSearch={this.handleListViewSearch}
                  filters={this.state.listParams}
                  sortField={this.state.listParams.sort_field}
                  sortDir={this.state.listParams.sort_dir}
                />
              </div>
              <div className="center">
                <ResponsivePagination
                  onPageChange={this.onPageChange}
                  currentPage={Number(this.state.listParams.page)}
                  pageTotal={Number(this.props.pageData.total)}
                  itemsPerPage={Number(this.state.listParams.per_page)}
                />
              </div>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Map" key="map">
            <div>
              <div className="landing-page__content--search">
                <Col md={10} xs={24}>
                  <MineSearch
                    initialValues={this.state.mapParams}
                    handleSearch={this.handleMapViewSearchByName}
                    isMapView
                  />
                  <br />
                  <br />
                  <Card>
                    <div>
                      <h3>EMLI GIS Links</h3>
                      <a
                        href="https://governmentofbc.maps.arcgis.com/apps/webappviewer/index.html?id=f024193c07a04a28b678170e1e2046f6"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Inspection Mapper
                      </a>
                      <span> - Not set up to use this? Contact the GIS team.</span>
                      <br />
                      {/* TODO: Change this to be the correct URL, if and when they change EMPR to EMLI */}
                      <a
                        href="https://nrm.sp.gov.bc.ca/sites/EMPR/mtb/_layouts/15/start.aspx#/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Sharepoint Requests Portal
                      </a>
                    </div>
                  </Card>
                </Col>
                <Col md={2} sm={0} xs={0}>
                  <div className="center">
                    <Divider type="vertical" />
                    <h2>OR</h2>
                    <Divider type="vertical" />
                  </div>
                </Col>
                <Col md={0} sm={24} xs={24}>
                  <div className="center">
                    <Divider>
                      <h2>OR</h2>
                    </Divider>
                  </div>
                </Col>
                <Col md={10} xs={24}>
                  <SearchCoordinatesForm onSubmit={this.handleMapViewSearchByCoordinate} />
                </Col>
              </div>
              {this.state.showMapSearchInfo && (
                <div>
                  <div className="center center-mobile">
                    {this.state.mapParams.mineName ? (
                      <h2>
                        Results for: <span className="p">{this.state.mapParams.mineName}</span>
                      </h2>
                    ) : (
                      <h2> Result for coordinate search:</h2>
                    )}
                  </div>
                  <div className="center">
                    <div className="inline-flex evenly center-mobile">
                      <h2>
                        Latitude: <span className="p">{this.state.mapParams.lat}</span>
                      </h2>
                      <h2>
                        Longitude: <span className="p">{this.state.mapParams.long}</span>
                      </h2>
                    </div>
                  </div>
                </div>
              )}
              <LoadingWrapper condition={this.state.isMapLoaded}>
                <Element name="mapElement">
                  <MineMapLeaflet
                    lat={Number(this.state.mapParams.lat)}
                    long={Number(this.state.mapParams.long)}
                    zoom={Number(this.state.mapParams.zoom)}
                    mineName={this.state.mapParams.mineName}
                    mineGuid={this.state.mineGuid}
                    mines={this.props.mines}
                    minesBasicInfo={this.props.pageData.mines}
                    fetchMineRecordById={this.props.fetchMineRecordById}
                    transformedMineTypes={this.props.transformedMineTypes}
                    mineRegionHash={this.props.mineRegionHash}
                    mineTenureHash={this.props.mineTenureHash}
                    mineCommodityOptionsHash={this.props.mineCommodityOptionsHash}
                    mineDisturbanceOptionsHash={this.props.mineDisturbanceOptionsHash}
                    history={this.props.history}
                  />
                </Element>
              </LoadingWrapper>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }

  render() {
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <div className="inline-flex between center-mobile center-mobile">
            <div>
              <h1>Mine Lookup</h1>
              <p>To find a mine summary, search in the list or map section below.</p>
            </div>
            <div>
              <AuthorizationWrapper permission={Permission.EDIT_MINES}>
                <AddButton
                  id="create-mine-record"
                  onClick={(event) =>
                    this.openCreateMineRecordModal(
                      event,
                      this.handleCreateMineRecordSubmit,
                      ModalContent.CREATE_MINE_RECORD
                    )
                  }
                >
                  {ModalContent.CREATE_MINE_RECORD}
                </AddButton>
              </AuthorizationWrapper>
            </div>
          </div>
        </div>
        <div className="landing-page__content">{this.renderCorrectView()}</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  pageData: getMinesPageData(state),
  mineRegionHash: getMineRegionHash(state),
  mineTenureHash: getMineTenureTypesHash(state),
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  mineDisturbanceOptionsHash: getDisturbanceOptionHash(state),
  mineStatusDropDownOptions: getMineStatusDropDownOptions(state, false),
  mineRegionOptions: getMineRegionDropdownOptions(state),
  mineTenureTypes: getMineTenureTypeDropdownOptions(state, false),
  mineCommodityOptions: getDropdownCommodityOptions(state, false),
  transformedMineTypes: getTransformedMineTypes(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      fetchMineRecords,
      fetchMineRecordsForMap,
      createMineRecord,
      createMineTypes,
      openModal,
      closeModal,
    },
    dispatch
  );

Dashboard.propTypes = propTypes;
Dashboard.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

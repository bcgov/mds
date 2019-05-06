import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Element, scroller } from "react-scroll";
import { debounce, isEmpty } from "lodash";
import PropTypes from "prop-types";
import { Tabs, Col, Divider, notification } from "antd";
import queryString from "query-string";
import { openModal, closeModal } from "@/actions/modalActions";
import CustomPropTypes from "@/customPropTypes";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import {
  fetchMineRecords,
  createMineRecord,
  fetchMineRecordsForMap,
} from "@/actionCreators/mineActionCreator";
import {
  fetchStatusOptions,
  fetchRegionOptions,
  fetchMineTenureTypes,
  fetchMineDisturbanceOptions,
  fetchMineCommodityOptions,
  fetchPermitStatusOptions,
  fetchApplicationStatusOptions,
  fetchMineIncidentFollowActionOptions,
  setOptionsLoaded,
} from "@/actionCreators/staticContentActionCreator";
import { fetchPartyRelationshipTypes } from "@/actionCreators/partiesActionCreator";
import { getMines, getMineIds, getMinesPageData } from "@/selectors/mineSelectors";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getCommodityOptionHash,
  getMineStatusOptions,
  getMineRegionOptions,
  getMineTenureTypeOptions,
  getDropdownCommodityOptions,
  getOptionsLoaded,
} from "@/selectors/staticContentSelectors";
import MineList from "@/components/dashboard/minesHomePage/MineList";
import MineSearch from "@/components/dashboard/minesHomePage/MineSearch";
import SearchCoordinatesForm from "@/components/Forms/SearchCoordinatesForm";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as router from "@/constants/routes";
import Loading from "@/components/common/Loading";
import MineMap from "@/components/maps/MineMap";
import * as String from "@/constants/strings";
import * as Permission from "@/constants/permissions";
import * as ModalContent from "@/constants/modalContent";
import AddButton from "@/components/common/AddButton";

/**
 * @class Dashboard is the main landing page of the application, currently contains a List and Map View, ability to create a new mine, and search for a mine by name or lat/long.
 *
 */
const { TabPane } = Tabs;

const propTypes = {
  fetchMineRecords: PropTypes.func.isRequired,
  fetchMineRecordsForMap: PropTypes.func.isRequired,
  createMineRecord: PropTypes.func.isRequired,
  fetchStatusOptions: PropTypes.func.isRequired,
  setOptionsLoaded: PropTypes.func.isRequired,
  fetchMineCommodityOptions: PropTypes.func.isRequired,
  fetchMineDisturbanceOptions: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  pageData: CustomPropTypes.minePageData.isRequired,
  optionsLoaded: PropTypes.bool.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  fetchApplicationStatusOptions: PropTypes.func.isRequired,
  fetchMineIncidentFollowActionOptions: PropTypes.func.isRequired,
};

const joinOrRemove = (param, key) => (isEmpty(param) ? {} : { [key]: param.join(",") });
const formatParams = ({
  commodity = [],
  region = [],
  status = [],
  tenure = [],
  ...remainingParams
}) => ({
  ...joinOrRemove(commodity, "commodity"),
  ...joinOrRemove(region, "region"),
  ...joinOrRemove(status, "status"),
  ...joinOrRemove(tenure, "tenure"),
  ...remainingParams,
});

export class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.handleMineSearchDebounced = debounce(this.handleMineSearch, 1000);
    this.state = {
      mineList: false,
      lat: Number(String.DEFAULT_LAT),
      long: Number(String.DEFAULT_LONG),
      zoom: 6,
      showCoordinates: false,
      mineName: null,
      params: {
        page: String.DEFAULT_PAGE,
        per_page: String.DEFAULT_PER_PAGE,
        major: [],
        tsf: [],
        status: [],
        region: [],
        tenure: [],
        commodity: [],
        search: [],
      },
    };
  }

  componentDidMount() {
    const params = this.props.location.search;
    if (params) {
      this.renderDataFromURL(params);
    } else {
      this.props.history.push(
        router.MINE_HOME_PAGE.dynamicRoute({
          page: String.DEFAULT_PAGE,
          per_page: String.DEFAULT_PER_PAGE,
        })
      );
    }
    if (!this.props.optionsLoaded) {
      this.props.fetchStatusOptions();
      this.props.fetchRegionOptions();
      this.props.fetchMineTenureTypes();
      this.props.fetchMineDisturbanceOptions();
      this.props.fetchMineCommodityOptions();
      this.props.fetchPartyRelationshipTypes();
      this.props.fetchPermitStatusOptions();
      this.props.fetchApplicationStatusOptions();
      this.props.fetchMineIncidentFollowActionOptions();
      this.props.setOptionsLoaded();
    }
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
    this.setState({
      params: {},
      lat: Number(String.DEFAULT_LAT),
      long: Number(String.DEFAULT_LONG),
      zoom: 6,
    });
  }

  renderDataFromURL = (params) => {
    const {
      status,
      commodity,
      region,
      tenure,
      major,
      tsf,
      search,
      lat,
      long,
      zoom,
      ...remainingParams
    } = queryString.parse(params);
    const format = (param) => (param ? param.split(",").filter((x) => x) : []);
    this.setState({
      params: {
        status: format(status),
        commodity: format(commodity),
        region: format(region),
        tenure: format(tenure),
        major,
        tsf,
        search,
        ...remainingParams,
      },
    });
    if (remainingParams.map) {
      this.props.fetchMineRecordsForMap().then(() => {
        this.setState({ mineList: true });
      });
    } else {
      this.props.fetchMineRecords(params).then(() => {
        this.setState({ mineList: true });
      });
    }
    // set the lat, long, zoom, and blinking to true
    // Only do this if
    if (format(lat)[0] && format(long)[0]) {
      this.setState({
        lat: Number(format(lat)[0]),
        long: Number(format(long)[0]),
        zoom: format(zoom)[0] ? Number(format(zoom)[0]) : 6,
      });
      this.handleNavitationFromMine();
    }
  };

  onPageChange = (page, per_page) => {
    this.props.history.push(
      router.MINE_HOME_PAGE.dynamicRoute({
        ...formatParams(this.state.params),
        // Overwrite current page/per_page with values provided
        page,
        per_page,
      })
    );
  };

  /*
   * @param value = {latitude: '', longitude: ''} || 'longitude, latitude';
   */
  handleCoordinateSearch = (value) => {
    if (typeof value === "string") {
      const newVal = value.split(",");
      if (newVal[0] && newVal[1]) {
        this.setState({
          lat: Number(newVal[1]),
          long: Number(newVal[0]),
          zoom: 14,
          showCoordinates: true,
          mineName: newVal[2],
        });
        // TODO: spent 4 hours looking for a solution to not hardcoding this scroll value. Need to find a dynamic way of scroling the screen to this location.
        scroller.scrollTo("mapElement", {
          duration: 1000,
          smooth: true,
          isDynamic: true,
          offset: -60,
        });
      } else {
        this.setState({
          lat: Number(String.DEFAULT_LAT),
          long: Number(String.DEFAULT_LONG),
          zoom: 6,
          showCoordinates: false,
        });
        notification.error({ message: String.NO_COORDINATES, duration: 10 });
      }
    } else {
      this.setState({
        lat: Number(value.latitude),
        long: Number(value.longitude),
        zoom: 14,
        showCoordinates: true,
        mineName: null,
      });
      // window.scrollTo(0, this.mapRef.current.offsetTop);
      scroller.scrollTo("mapElement", {
        duration: 1000,
        smooth: true,
        isDynamic: true,
        offset: -60,
      });
    }
  };

  handleNavitationFromMine = () => {
    // TODO: spent 4 hours looking for a solution to not hardcoding this scroll value. Need to find a dynamic way of scroling the screen to this location.
    scroller.scrollTo("landing-page__content", {
      duration: 1000,
      smooth: true,
      isDynamic: true,
      offset: 200,
    });
  };

  handleTabChange = (key) => {
    const { page, per_page, search } = this.state.params;
    this.setState({
      mineList: false,
      showCoordinates: false,
      mineName: "",
      lat: Number(String.DEFAULT_LAT),
      long: Number(String.DEFAULT_LONG),
      zoom: 6,
    });
    if (key === "map") {
      this.props.history.push(router.MINE_HOME_PAGE.mapRoute(page, per_page, search));
    } else {
      this.props.history.push(router.MINE_HOME_PAGE.dynamicRoute({ page, per_page, search }));
    }
  };

  handleMineSearch = (searchParams, clear = false) => {
    const formattedSearchParams = formatParams(searchParams);
    const persistedParams = clear ? {} : formatParams(this.state.params);

    this.props.history.push(
      router.MINE_HOME_PAGE.dynamicRoute({
        // Start from existing state
        ...persistedParams,
        // Overwrite prev params with any newly provided search params
        ...formattedSearchParams,
        // Reset page number
        page: String.DEFAULT_PAGE,
        // Retain per_page if present
        per_page: this.state.params.per_page ? this.state.params.per_page : String.DEFAULT_PER_PAGE,
      })
    );
  };

  handleSubmit = (value) => {
    const mineStatus = value.mine_status.join(",");
    return this.props
      .createMineRecord({ ...value, mine_status: mineStatus })
      .then(() => {
        this.props.closeModal();
      })
      .then(() => {
        const params = this.props.location.search;
        this.props.fetchMineRecords(params);
      });
  };

  openModal(event, onSubmit, title) {
    const handleDelete = () => {};
    event.preventDefault();
    this.props.openModal({
      props: {
        handleDelete,
        onSubmit,
        title,
      },
      content: modalConfig.MINE_RECORD,
    });
  }

  renderCorrectView() {
    const { search, map, page, per_page } = this.state.params;
    const isMap = map ? "map" : "list";
    if (this.state.mineList) {
      return (
        <div>
          <Tabs
            activeKey={isMap}
            size="large"
            animated={{ inkBar: true, tabPane: false }}
            onTabClick={this.handleTabChange}
          >
            <TabPane tab="List" key="list">
              <MineSearch
                initialValues={this.state.params}
                {...this.props}
                handleMineSearch={this.handleMineSearchDebounced}
                searchValue={search}
              />
              <div className="tab__content ">
                <MineList
                  mines={this.props.mines}
                  mineIds={this.props.mineIds}
                  mineRegionHash={this.props.mineRegionHash}
                  mineTenureHash={this.props.mineTenureHash}
                  mineCommodityOptionsHash={this.props.mineCommodityOptionsHash}
                  handleMineSearch={this.handleMineSearch}
                  sortField={this.state.params.sort_field}
                  sortDir={this.state.params.sort_dir}
                />
              </div>
              <div className="center">
                <ResponsivePagination
                  onPageChange={this.onPageChange}
                  currentPage={Number(page)}
                  pageTotal={Number(this.props.pageData.total)}
                  itemsPerPage={Number(per_page)}
                />
              </div>
            </TabPane>
            <TabPane tab="Map" key="map">
              <div className="landing-page__content--search">
                <Col md={10} xs={24}>
                  <MineSearch
                    initialValues={this.state.params}
                    handleCoordinateSearch={this.handleCoordinateSearch}
                    isMapView
                  />
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
                  <SearchCoordinatesForm onSubmit={this.handleCoordinateSearch} />
                </Col>
              </div>
              <div>
                <div className="center center-mobile">
                  {this.state.mineName && (
                    <h2>
                      Results for: <span className="p">{this.state.mineName}</span>
                    </h2>
                  )}
                </div>
                <div className="center">
                  <div className="inline-flex evenly center-mobile">
                    {this.state.showCoordinates && [
                      <h2>
                        Latitude: <span className="p">{this.state.lat}</span>
                      </h2>,
                      <h2>
                        Longitude: <span className="p">{this.state.long}</span>
                      </h2>,
                    ]}
                  </div>
                </div>
              </div>
              <Element name="mapElement" />
              <div>
                <MineMap {...this.state} />
              </div>
            </TabPane>
          </Tabs>
        </div>
      );
    }
    return <Loading />;
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
              <AuthorizationWrapper permission={Permission.ADMIN}>
                <AddButton
                  onClick={(event) =>
                    this.openModal(event, this.handleSubmit, ModalContent.CREATE_MINE_RECORD)
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
  mineIds: getMineIds(state),
  pageData: getMinesPageData(state),
  mineRegionHash: getMineRegionHash(state),
  mineTenureHash: getMineTenureTypesHash(state),
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  mineStatusOptions: getMineStatusOptions(state),
  mineRegionOptions: getMineRegionOptions(state),
  mineTenureTypes: getMineTenureTypeOptions(state),
  mineCommodityOptions: getDropdownCommodityOptions(state),
  optionsLoaded: getOptionsLoaded(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecords,
      fetchMineRecordsForMap,
      fetchStatusOptions,
      fetchRegionOptions,
      createMineRecord,
      fetchMineTenureTypes,
      fetchMineCommodityOptions,
      fetchMineDisturbanceOptions,
      fetchPermitStatusOptions,
      fetchApplicationStatusOptions,
      openModal,
      closeModal,
      setOptionsLoaded,
      fetchPartyRelationshipTypes,
      fetchMineIncidentFollowActionOptions,
    },
    dispatch
  );

Dashboard.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);

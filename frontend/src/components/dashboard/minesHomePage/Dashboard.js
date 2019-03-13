import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Element, scroller } from "react-scroll";
import { debounce } from "lodash";
import PropTypes from "prop-types";
import { Tabs, Col, Divider, notification, Button } from "antd";
import queryString from "query-string";
import { openModal, closeModal } from "@/actions/modalActions";
import CustomPropTypes from "@/customPropTypes";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import { fetchMineRecords, createMineRecord } from "@/actionCreators/mineActionCreator";
import {
  fetchStatusOptions,
  fetchRegionOptions,
  fetchMineTenureTypes,
  fetchMineDisturbanceOptions,
  fetchMineCommodityOptions,
  fetchPermitStatusOptions,
  fetchApplicationStatusOptions,
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
  getMineTenureTypes,
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

/**
 * @class Dashboard is the main landing page of the application, currently contains a List and Map View, ability to create a new mine, and search for a mine by name or lat/long.
 *
 */
const { TabPane } = Tabs;

const propTypes = {
  fetchMineRecords: PropTypes.func.isRequired,
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
    this.setState({ params: {} });
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
    this.props.fetchMineRecords(params).then(() => {
      this.setState({ mineList: true });
    });
  };

  onPageChange = (page, per_page) => {
    const { major, tsf, search, status, region, tenure, commodity } = this.state.params;
    this.props.history.push(
      router.MINE_HOME_PAGE.dynamicRoute({
        page,
        per_page,
        major,
        tsf,
        search,
        status: status && status.join(","),
        region: region && region.join(","),
        tenure: tenure && tenure.join(","),
        commodity: commodity && commodity.join(","),
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
        // window.scrollTo(0, this.mapRef.current.offsetTop);
      } else {
        this.setState({
          lat: String.DEFAULT_LAT,
          long: String.DEFAULT_LONG,
          showCoordinates: false,
        });
        notification.error({ message: String.NO_COORDINATES, duration: 10 });
      }
    } else {
      this.setState({
        lat: Number(value.latitude),
        long: Number(value.longitude),
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

  handleTabChange = (key) => {
    const { page, per_page, search } = this.state.params;
    this.setState({ mineList: false, showCoordinates: false, mineName: "" });
    if (key === "map") {
      this.props.history.push(router.MINE_HOME_PAGE.mapRoute(page, per_page, search));
    } else {
      this.props.history.push(router.MINE_HOME_PAGE.dynamicRoute({ page, per_page, search }));
    }
  };

  handleMineSearch = (searchParams) => {
    const per_page = this.state.params.per_page
      ? this.state.params.per_page
      : String.DEFAULT_PER_PAGE;
    // reset page when a search is initiated
    this.props.history.push(
      router.MINE_HOME_PAGE.dynamicRoute({ page: String.DEFAULT_PAGE, per_page, ...searchParams })
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
                <MineList {...this.props} />
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
                <Button
                  className="full-mobile"
                  type="primary"
                  onClick={(event) =>
                    this.openModal(event, this.handleSubmit, ModalContent.CREATE_MINE_RECORD)
                  }
                >
                  {ModalContent.CREATE_MINE_RECORD}
                </Button>
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
  mineTenureTypes: getMineTenureTypes(state),
  mineCommodityOptions: getDropdownCommodityOptions(state),
  optionsLoaded: getOptionsLoaded(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecords,
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
    },
    dispatch
  );

Dashboard.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);

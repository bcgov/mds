import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Element, scroller } from "react-scroll";
import { debounce, isEmpty } from "lodash";
import PropTypes from "prop-types";
import { Tabs, Col, Divider, notification, Card } from "antd";
import queryString from "query-string";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  fetchMineRecords,
  createMineRecord,
  createMineTypes,
  fetchMineRecordsForMap,
  fetchMineRecordById,
} from "@common/actionCreators/mineActionCreator";
import {
  getMines,
  getMineIds,
  getMinesPageData,
  getTransformedMineTypes,
} from "@common/selectors/mineSelectors";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getCommodityOptionHash,
  getMineStatusDropDownOptions,
  getMineRegionDropdownOptions,
  getMineTenureTypeDropdownOptions,
  getDropdownCommodityOptions,
} from "@common/selectors/staticContentSelectors";
import * as Strings from "@common/constants/strings";
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
import AddButton from "@/components/common/AddButton";

/**
 * @class Dashboard is the main landing page of the application, currently contains a List and Map View, ability to create a new mine, and search for a mine by name or lat/long.
 *
 */
const { TabPane } = Tabs;

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchMineRecords: PropTypes.func.isRequired,
  fetchMineRecordsForMap: PropTypes.func.isRequired,
  createMineRecord: PropTypes.func.isRequired,
  createMineTypes: PropTypes.func.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  transformedMineTypes: CustomPropTypes.transformedMineTypes.isRequired,
  mineIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  pageData: CustomPropTypes.minePageData.isRequired,
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
      isListLoaded: false,
      isMapLoaded: false,
      lat: Number(Strings.DEFAULT_LAT),
      long: Number(Strings.DEFAULT_LONG),
      zoom: Strings.DEFAULT_ZOOM,
      showCoordinates: false,
      mineName: null,
      params: {
        page: Strings.DEFAULT_PAGE,
        per_page: Strings.DEFAULT_PER_PAGE,
        status: [],
        region: [],
        tenure: [],
        commodity: [],
        search: [],
        ...this.params,
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
          page: Strings.DEFAULT_PAGE,
          per_page: Strings.DEFAULT_PER_PAGE,
        })
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      const params = nextProps.location.search;
      this.setState({ isListLoaded: false, isMapLoaded: false });
      this.renderDataFromURL(params);
    }
  }

  componentWillUnmount() {
    this.handleMineSearchDebounced.cancel();
    this.setState({
      params: {},
      lat: Number(Strings.DEFAULT_LAT),
      long: Number(Strings.DEFAULT_LONG),
      zoom: Strings.DEFAULT_ZOOM,
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
      mineName,
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
        this.setState({ isMapLoaded: true });
      });
    } else {
      this.props.fetchMineRecords(params).then(() => {
        this.setState({ isListLoaded: true });
      });
    }

    if (format(lat)[0] && format(long)[0]) {
      this.setState({
        lat: Number(format(lat)[0]),
        long: Number(format(long)[0]),
        zoom: format(zoom)[0] ? Number(format(zoom)[0]) : Strings.DEFAULT_ZOOM,
        showCoordinates: true,
        mineName: format(mineName)[0],
      });
      this.handleScroll("landing-page__content", 200);
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
        this.props.history.push(
          router.MINE_HOME_PAGE.mapRoute({
            lat: newVal[1],
            long: newVal[0],
            zoom: Strings.HIGH_ZOOM,
            mineName: newVal[2],
          })
        );
        this.handleScroll("mapElement", -60);
      } else {
        this.setState({
          lat: Number(Strings.DEFAULT_LAT),
          long: Number(Strings.DEFAULT_LONG),
          zoom: Strings.DEFAULT_ZOOM,
          showCoordinates: false,
        });
        notification.error({ message: Strings.NO_COORDINATES, duration: 10 });
      }
    } else {
      this.props.history.push(
        router.MINE_HOME_PAGE.mapRoute({
          lat: value.latitude,
          long: value.longitude,
          zoom: Strings.HIGH_ZOOM,
        })
      );
      this.handleScroll("mapElement", -60);
    }
  };

  handleScroll = (element, offset) => {
    // FIXME: scroll dynamically instead of by a hardcoded value
    scroller.scrollTo(element, {
      duration: 1000,
      smooth: true,
      isDynamic: true,
      offset,
    });
  };

  handleTabChange = (key) => {
    const { page, per_page, search } = this.state.params;
    this.setState({
      isListLoaded: false,
      isMapLoaded: false,
      showCoordinates: false,
      mineName: "",
      lat: Number(Strings.DEFAULT_LAT),
      long: Number(Strings.DEFAULT_LONG),
      zoom: Strings.DEFAULT_ZOOM,
    });
    if (key === "map") {
      this.props.history.push(router.MINE_HOME_PAGE.mapRoute());
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
        page: Strings.DEFAULT_PAGE,
        // Retain per_page if present
        per_page: this.state.params.per_page
          ? this.state.params.per_page
          : Strings.DEFAULT_PER_PAGE,
      })
    );
  };

  handleSubmit = (value) => {
    const mineStatus = value.mine_status.join(",");
    this.props.createMineRecord({ ...value, mine_status: mineStatus }).then((response) => {
      this.props.createMineTypes(response.data.mine_guid, value.mine_types).then(() => {
        this.props.closeModal();
        const params = this.props.location.search;
        this.props.fetchMineRecords(params);
      });
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
        isNewRecord: true,
      },
      content: modalConfig.MINE_RECORD,
    });
  }

  renderCorrectView() {
    const { search, map, page, per_page } = this.state.params;
    const isMap = map ? "map" : "list";
    const mineNameMine =
      this.state.mineName &&
      this.props.mines &&
      this.props.mines.length > 0 &&
      this.props.mines.filter((mine) => mine.mine_name === this.state.mineName)[0];
    const mineGuid = mineNameMine ? mineNameMine.mine_guid : null;

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

            <div>
              <div className="tab__content">
                <MineList
                  isLoaded={this.state.isListLoaded}
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
            </div>
          </TabPane>
          <TabPane tab="Map" key="map">
            <div>
              <div className="landing-page__content--search">
                <Col md={10} xs={24}>
                  <MineSearch
                    initialValues={this.state.params}
                    handleCoordinateSearch={this.handleCoordinateSearch}
                    isMapView
                  />
                  <br />
                  <br />
                  <Card>
                    <div>
                      <h3>EMPR GIS Links</h3>
                      <a
                        href="https://governmentofbc.maps.arcgis.com/apps/webappviewer/index.html?id=f024193c07a04a28b678170e1e2046f6"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Inspection Mapper
                      </a>
                      <span> - Not set up to use this? Contact the GIS team.</span>
                      <br />
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
                  <SearchCoordinatesForm onSubmit={this.handleCoordinateSearch} />
                </Col>
              </div>
              {this.state.showCoordinates && (
                <div>
                  <div className="center center-mobile">
                    {this.state.mineName ? (
                      <h2>
                        Results for: <span className="p">{this.state.mineName}</span>
                      </h2>
                    ) : (
                      <h2> Result for coordinate search:</h2>
                    )}
                  </div>
                  <div className="center">
                    <div className="inline-flex evenly center-mobile">
                      <h2>
                        Latitude: <span className="p">{this.state.lat}</span>
                      </h2>
                      <h2>
                        Longitude: <span className="p">{this.state.long}</span>
                      </h2>
                    </div>
                  </div>
                </div>
              )}
              <LoadingWrapper condition={this.state.isMapLoaded}>
                <Element name="mapElement">
                  <div>
                    <MineMapLeaflet
                      lat={this.state.lat}
                      long={this.state.long}
                      zoom={this.state.zoom}
                      minesBasicInfo={this.props.pageData.mines}
                      mineName={this.state.mineName}
                      mineGuid={mineGuid}
                      mines={this.props.mines}
                      fetchMineRecordById={this.props.fetchMineRecordById}
                      transformedMineTypes={this.props.transformedMineTypes}
                      mineCommodityOptionsHash={this.props.mineCommodityOptionsHash}
                      history={this.props.history}
                    />
                  </div>
                </Element>
              </LoadingWrapper>
            </div>
          </TabPane>
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
  mineStatusDropDownOptions: getMineStatusDropDownOptions(state),
  mineRegionOptions: getMineRegionDropdownOptions(state),
  mineTenureTypes: getMineTenureTypeDropdownOptions(state),
  mineCommodityOptions: getDropdownCommodityOptions(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

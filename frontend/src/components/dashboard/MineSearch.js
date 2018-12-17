import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { AutoComplete, Input, Icon, Button, Row, Col } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty, some, negate } from "lodash";
import { fetchMineNameList } from "@/actionCreators/mineActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import AdvancedSearchForm from "@/components/forms/AdvancedSearchForm";

/**
 * @class MineSearch contains logic for both landing page List view and Map view, searches though mine_name and mine_no to either Redirect to Mine Summary page, or to locate coordinates of a mine on the landing page map.
 */
const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  handleMineSearch: PropTypes.func,
  handleCoordinateSearch: PropTypes.func,
  mineNameList: PropTypes.array.isRequired,
  isMapView: PropTypes.bool,
  searchValue: PropTypes.string,
};

const checkAdvancedSearch = ({ status, region, tenure, commodity, TSF, major }) =>
  TSF || major || some([status, region, tenure, commodity], negate(isEmpty));

export class MineSearch extends Component {
  state = {
    isAdvanceSearch: checkAdvancedSearch(this.props.initialValues),
  };

  componentDidMount() {
    this.props.fetchMineNameList();
  }

  /**
   *  re-center the map to the mines coordinates
   * @param value = 'mine.long, mine.lat';
   */
  handleCoordinateSearch = (value) => {
    this.props.handleCoordinateSearch(value);
  };

  /**
   *  If the user has typed more than 3 characters filter the search
   * If they clear the search, revert back to default search set
   */
  handleChange = (value) => {
    if (value.length > 2) {
      this.props.fetchMineNameList(value);
    } else if (value.length === 0) {
      this.props.fetchMineNameList();
    }
  };

  /**
   * filter mineList with new search input;
   */
  handleSearch = (value = {}) => {
    const search = value.target && value.target.value;
    const { commodity = [], region = [], status = [], tenure = [], TSF, major } = search
      ? {}
      : value;
    this.props.handleMineSearch({
      search,
      TSF,
      major,
      commodity: commodity.join(","),
      region: region.join(","),
      status: status.join(","),
      tenure: tenure.join(","),
    });
  };

  toggleAdvancedSearch = () => {
    this.setState({ isAdvanceSearch: !this.state.isAdvanceSearch });
  };

  transformData = (data) => {
    if (data) {
      const dataList = [];
      data.map((opt) => {
        const search = opt.mine_name.concat(" - ", opt.mine_no);
        const coordinates = opt.longitude.concat(",", opt.latitude);
        const mineDetails = coordinates.concat(",", opt.mine_name);
        dataList.push(
          <AutoComplete.Option key={opt.guid} value={mineDetails}>
            {search}
          </AutoComplete.Option>
        );
      });
      return dataList;
    }
  };

  render() {
    if (this.props.isMapView) {
      return (
        <RenderAutoComplete
          placeholder="Search for a mine by name"
          handleSelect={this.handleCoordinateSearch}
          data={this.transformData(this.props.mineNameList)}
          handleChange={this.handleChange}
        />
      );
    }
    return (
      <div>
        <Row>
          <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Input
              defaultValue={this.props.searchValue ? this.props.searchValue : undefined}
              placeholder="Search for a mine using name, ID, or permit number"
              onChange={this.handleSearch}
              suffix={<Icon type="search" style={{ color: "#537C52", fontSize: 20 }} />}
            />
          </Col>
        </Row>
        {this.state.isAdvanceSearch && (
          <div className="advanced-search__container">
            <AdvancedSearchForm
              {...this.props}
              onSubmit={this.handleSearch}
              handleSearch={this.handleSearch}
            />
          </div>
        )}
        <Row>
          <Col md={{ span: 20, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Button onClick={this.toggleAdvancedSearch}>
              {this.state.isAdvanceSearch ? "Close Advanced Search" : "Expand Advanced Search"}
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineNameList: getMineNames(state).mines,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineNameList,
    },
    dispatch
  );

MineSearch.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineSearch);

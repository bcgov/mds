import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { AutoComplete, Input, Icon, Button, Row, Col } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty, some, negate } from "lodash";
import { fetchMineNameList } from "@/actionCreators/mineActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";
import AdvancedSearchForm from "@/components/Forms/AdvancedSearchForm";

/**
 * @class MineSearch contains logic for both landing page List view and Map view, searches though mine_name and mine_no to either Redirect to Mine Summary page, or to locate coordinates of a mine on the landing page map.
 */
const propTypes = {
  fetchMineNameList: PropTypes.func.isRequired,
  handleMineSearch: PropTypes.func,
  handleCoordinateSearch: PropTypes.func,
  mineNameList: PropTypes.array,
  isMapView: PropTypes.bool,
  // searchValue: PropTypes.string,
};

const defaultProps = {
  mineNameList: [],
};

const checkAdvancedSearch = ({ status, region, tenure, commodity, tsf, major, searchValue }) =>
  tsf || major || some([status, region, tenure, commodity], negate(isEmpty));

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
    console.log("*******THIS WAS CALLED********");
    const search = value.target && value.target.value;
    const { commodity, region, status, tenure, tsf, major } = search ? {} : value;
    this.props.handleMineSearch({
      search,
      tsf,
      major,
      commodity: commodity && commodity.join(","),
      region: region && region.join(","),
      status: status && status.join(","),
      tenure: tenure && tenure.join(","),
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
    console.log("The props in the mineSearch form are:");
    console.log(this.props);
    console.log(this);
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
    console.log("The props in the mineSearch 2 form are:");
    console.log(this.props);
    return (
      <div>
        <Row>
          <Col md={{ span: 12, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            {/* <Input
              defaultValue={this.props.searchValue ? this.props.searchValue : undefined}
              placeholder="Search for a mine using name, ID, or permit number"
              onChange={this.handleSearch}
              suffix={<Icon type="search" style={{ color: "#5e46a1", fontSize: 20 }} />}
            /> */}
            {/* {this.state.isAdvanceSearch && ( */}
            <span className="advanced-search__container">
              <AdvancedSearchForm
                {...this.props}
                onSubmit={this.handleSearch}
                handleSearch={this.handleSearch}
                // searchValue={this.props.searchValue}
              />
            </span>
            {/* )} */}
          </Col>
        </Row>
        <Row>
          <Col md={{ span: 20, offset: 6 }} xs={{ span: 20, offset: 2 }}>
            <Button className="btn--dropdown" onClick={this.toggleAdvancedSearch}>
              {this.state.isAdvanceSearch ? "Collapse Filters" : "Expand Filters"}
              <Icon type={this.state.isAdvanceSearch ? "up" : "down"} />
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
MineSearch.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineSearch);

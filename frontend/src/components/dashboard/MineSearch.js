import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { AutoComplete, Input, Icon } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { fetchMineNameList } from "@/actionCreators/mineActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
import RenderAutoComplete from "@/components/common/RenderAutoComplete";

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

const defaultProps = {
  mineNameList: [],
};

export class MineSearch extends Component {
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
  handleSearch = (value) => {
    this.props.handleMineSearch(value.target.value);
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
    } else {
      return (
        <Input
          defaultValue={this.props.searchValue ? this.props.searchValue : undefined}
          placeholder="Search for a mine using name, ID, or permit number"
          onChange={this.handleSearch}
          suffix={<Icon type="search" style={{ color: "#537C52", fontSize: 20 }} />}
        />
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    mineNameList: getMineNames(state).mines,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchMineNameList,
    },
    dispatch
  );
};

MineSearch.propTypes = propTypes;
MineSearch.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineSearch);

import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import RenderAutoComplete from '@/components/reusables/RenderAutoComplete';
import SearchCoordinatesForm from '@/components/mine/Forms/SearchCoordinatesForm';
import * as router from '@/constants/routes';
import MineMap from '@/components/maps/MineMap';

const propTypes = {
  mineNameList: PropTypes.array.isRequired,
};

const defaultProps = {
  mineNameList: [],
};

class MapSearch extends Component {
  state = { lat: null, long: null }

  handleSearch = (value) => {
    this.props.handleCoordinateSearch(value)
  }

  handleSubmit = (value) => {
    this.props.handleCoordinateSearch(value)
  }

  render() {
    return (
      <div>
        <div className="left">
          <RenderAutoComplete handleSearch={this.handleSearch} data={this.props.mineNameList} />
        </div>
        <div className="right">
          <SearchCoordinatesForm onSubmit={this.handleSubmit}/>
        </div>
      </div>
    );
  }
}

MapSearch.propTypes = propTypes;
MapSearch.defaultProps = defaultProps;
export default MapSearch;
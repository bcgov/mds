import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import RenderAutoComplete from '@/components/reusables/RenderAutoComplete';
import * as router from '@/constants/routes';

const propTypes = {
  mineNameList: PropTypes.array.isRequired,
};

const defaultProps = {
  mineNameList: [],
};

class MineSearch extends Component {
  state = { redirectTo: null }

  handleSearch = (value) => {
    this.setState({ redirectTo: router.MINE_SUMMARY.dynamicRoute(value) })
  }
  render() {
    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    }
    return (
      <div>
        <RenderAutoComplete handleSearch={this.handleSearch} data={this.props.mineNameList} />
      </div>
    );
  }
}

MineSearch.propTypes = propTypes;
MineSearch.defaultProps = defaultProps;
export default MineSearch;
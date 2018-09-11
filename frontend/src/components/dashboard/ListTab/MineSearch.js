import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getMineNameList } from '@/actionCreators/mineActionCreator';
import { getMineNames } from '@/selectors/mineSelectors';
import RenderAutoComplete from '@/components/reusables/RenderAutoComplete';
import * as router from '@/constants/routes';
import { AutoComplete } from 'antd';

const propTypes = {
  getMineNameList: PropTypes.func.isRequired,
  handleCoordinateSearch: PropTypes.func,
  mineNameList: PropTypes.array.isRequired,
  isMapView: PropTypes.bool,
};

const defaultProps = {
  mineNameList: [],
};

export class MineSearch extends Component {
  state = { redirectTo: null }

  componentDidMount() {
    // Get the initial list of mines
    this.props.getMineNameList();
  }

  /**
   * if isMapView re-center the map to the mines coordinates, else is isListView redirect to the selected mine summary page.
   * @param value = mine.guid || 'mine.long, mine.lat';
   */
  handleListSelect = (value) => {
    this.props.isMapView ?
    this.props.handleCoordinateSearch(value) :
    this.setState({ redirectTo: router.MINE_SUMMARY.dynamicRoute(value) });
  }

  /**
   *  If the user has typed more than 3 characters filter the search
   * If they clear the search, revert back to default search set
   */
  handleChange = (value) => {
    if (value.length > 2){
      this.props.getMineNameList(value);
    }
    else if (value.length === 0) {
      this.props.getMineNameList();
    }
  }

  transformData = (data) => {
    if (data) {
      const dataList = [];
      data.map((opt) => {
      const search = opt.mine_name.concat(" - ", opt.mine_no);
      const coordinates = opt.longitude.concat(",", opt.latitude);
      dataList.push(
        <AutoComplete.Option key={opt.guid} value={this.props.isMapView ? coordinates : opt.guid}>
          {search}
        </AutoComplete.Option>
      )})
      return dataList;
    }
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    }
    return (
      <div className="center">
        <RenderAutoComplete 
          handleSelect={this.handleListSelect}
          data={this.transformData(this.props.mineNameList)}
          handleChange={this.handleChange}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    mineNameList: getMineNames(state).mines
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getMineNameList,
  }, dispatch);
};

MineSearch.propTypes = propTypes;
MineSearch.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineSearch);
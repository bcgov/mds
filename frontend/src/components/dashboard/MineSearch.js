import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import RenderAutoComplete from '@/components/reusables/RenderAutoComplete';
import * as router from '@/constants/routes';
import { AutoComplete } from 'antd';

const propTypes = {
  mineNameList: PropTypes.array.isRequired,
};

const defaultProps = {
  mineNameList: [],
};

class MineSearch extends Component {
  state = { redirectTo: null }

  handleSelect = (value) => {
    this.setState({ redirectTo: router.MINE_SUMMARY.dynamicRoute(value) })
  }

  transformData = (data) => {
    if (data) {
      const dataList = [];
      data.map((opt) => {
      const search = opt.mine_name.concat(" - ", opt.mine_no);
      dataList.push(
        <AutoComplete.Option key={opt.guid} value={opt.guid}>
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
    const data = this.transformData(this.props.mineNameList);
    return (
      <div className="center">
        <RenderAutoComplete handleSelect={this.handleSelect} data={data} />
      </div>
    );
  }
}

MineSearch.propTypes = propTypes;
MineSearch.defaultProps = defaultProps;
export default MineSearch;
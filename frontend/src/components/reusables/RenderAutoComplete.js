import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Icon, Input, AutoComplete } from 'antd';

const propTypes = {
  handleSelect: PropTypes.func,
  data: PropTypes.array
};

/**
 * Ant Design `AutoComplete` component for redux-form.
 */
class RenderAutoComplete extends Component {

  render() {
    return (
      <div>
        <AutoComplete
          dropdownMatchSelectWidth={true}
          size="large"
          backfill={true}
          style={{ width: '50%' }}
          dataSource={this.props.data}
          placeholder="Search for a mine"
          optionLabelProp="value"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          onSelect={this.props.handleSelect}
        >
          <Input suffix={<Icon type="search" style={{ color: '#537C52', fontSize: 20 }} />} />
        </AutoComplete>
      </div>
    );
  }
}

RenderAutoComplete.propTypes = propTypes;

export default RenderAutoComplete;

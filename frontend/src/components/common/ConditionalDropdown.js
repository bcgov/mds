import React from 'react';
import { Dropdown, Button, Icon } from 'antd';
import PropTypes from 'prop-types';

import { CreateGuard } from '@/HOC/CreateGuard';

/**
 * @constant ConditionalDropdown is a conditionally rendered button depending on user permissions. 
 * It accapts and button label as `string`, button type as `type`, overlay is the dropdown content
 * 
 */

const propTypes = {
  handleAction: PropTypes.func,
  overlay: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  type: PropTypes.string,
  string: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

const defaultProps = {
 overlay: "",
 type: 'primary',
 string: '',
};

export const ConditionalDropdown = (props) => {
  return (
    <Dropdown overlay={props.overlay} placement="bottomLeft">
      <Button type={props.type}>
        {props.string}
      </Button>
    </Dropdown>
  );
};

ConditionalDropdown.propTypes = propTypes;
ConditionalDropdown.defaultProps = defaultProps;

export default CreateGuard(ConditionalDropdown);
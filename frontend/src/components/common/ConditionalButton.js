import React from 'react';
import { Button, Dropdown } from 'antd';
import PropTypes from 'prop-types';

import { CreateGuard } from '@/HOC/CreateGuard';

/**
 * @constant ConditionalButton is a conditionally rendered button depending on user permissions. 
 * The component can either be a single button with an action || a dropdown with a menu passed in as a prop.
 * 
 */

const propTypes = {
  handleAction: PropTypes.func,
  string: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  type: PropTypes.string,
  isDropdown: PropTypes.bool,
  overlay: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

const defaultProps = {
 string: '',
 type: 'primary',
 isDropdown: false,
 overlay: ''
};

export const ConditionalButton = (props) => (
  <div>
    {!props.isDropdown && (
      <Button
        className="full-mobile"
        type={props.type} 
        onClick={props.handleAction}
      >
        {props.string}
      </Button>
)}
    {props.isDropdown && (
      <Dropdown overlay={props.overlay} placement="bottomLeft">
        <Button type={props.type}>
          {props.string}
        </Button>
      </Dropdown>
)}
  </div>
  );

ConditionalButton.propTypes = propTypes;
ConditionalButton.defaultProps = defaultProps;

export default CreateGuard(ConditionalButton);
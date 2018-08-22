import React from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import { CreateGuard } from '../../HOC/CreateGuard';

/**
 * @constant ConditionalButton is a conditionally rendered button depending on user permissions. 
 * It accapts any function as `handleAction` and button label as `string`, button type as `type`
 * 
 */

const propTypes = {
  handleAction: PropTypes.func.isRequired,
  string: PropTypes.string.isRequired,
  type: PropTypes.string
};

const defaultProps = {
 string: '',
 type: 'primary'
};

export const ConditionalButton = (props) => {
  return (
    <Button 
      type={props.type} 
      onClick={props.handleAction}
    >
      {props.string}
    </Button>
  );
};

ConditionalButton.propTypes = propTypes;
ConditionalButton.defaultProps = defaultProps;

export default CreateGuard(ConditionalButton);
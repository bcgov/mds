import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  img: PropTypes.object.isRequired,
  primaryMessage: PropTypes.string.isRequired,
  secondaryMessage: PropTypes.string
};

const defaultProps = {
  img: '',
  primaryMessage: '',
  secondaryMessage: ''
};

const NullScreen = (props) => {
  return (
    <div className="null-screen">
      <img src={props.img} />
      <h1>{props.primaryMessage}</h1>
      <h5>{props.secondaryMessage}</h5>
    </div>
  );
};

NullScreen.defaultProps = defaultProps;
NullScreen.propTypes = propTypes;

export default NullScreen;
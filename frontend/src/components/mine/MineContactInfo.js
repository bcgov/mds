
/**
 * @class MineContactInfo.js contains all information under the 'Contact Information' tab on the MnieDashboard (including all Mine Manager information);
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  mine: PropTypes.object.isRequired,
};

const defaultProps = {
  mine: {},
};


class MineContactInfo extends Component {
  render() {
    return (
      <div>
        <h1>contact information</h1>
      </div>
    );
  }
}

MineContactInfo.propTypes = propTypes;
MineContactInfo.defaultProps = defaultProps;

export default MineContactInfo;
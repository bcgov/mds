
/**
 * @class MineContactInfo.js contains all information under the 'Contact Information' tab on the MnieDashboard (including all Mine Manager information);
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ViewMineManager from './ViewMineManager';


const propTypes = {
  mine: PropTypes.object.isRequired,
};

const defaultProps = {
  mine: {},
};


export class MineContactInfo extends Component {
  render() {
    return (
      <div>
        <ViewMineManager mine={this.props.mine} />
      </div>
    );
  }
}

MineContactInfo.propTypes = propTypes;
MineContactInfo.defaultProps = defaultProps;

export default MineContactInfo;
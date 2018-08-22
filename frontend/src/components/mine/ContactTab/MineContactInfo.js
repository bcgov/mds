
/**
 * @class MineContactInfo.js contains all information under the 'Contact Information' tab on the MnieDashboard (including all Mine Manager information);
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UpdateMineManager from './UpdateMineManager';
import ViewMineManager from './ViewMineManager';


const propTypes = {
  mine: PropTypes.object.isRequired,
  getPersonnelById: PropTypes.func,
};

const defaultProps = {
  mine: {},
};


export class MineContactInfo extends Component {
  state = {
    updateManager: false,
  }

  handleManagerUpdate = () => {
    this.setState({
      updateManager: !this.state.updateManager
    })
  }

  renderManagerView(){
    if (this.state.updateManager) {
      return (<UpdateMineManager mine={this.props.mine} handleManagerUpdate={this.handleManagerUpdate}/>)
    } else {
      return (<ViewMineManager mine={this.props.mine} handleManagerUpdate={this.handleManagerUpdate}/>)
    }
  }
  render() {
    return (
      <div>
         {this.renderManagerView()}
      </div>
    );
  }
}

MineContactInfo.propTypes = propTypes;
MineContactInfo.defaultProps = defaultProps;

export default MineContactInfo;
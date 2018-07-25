import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createMineRecord } from '../actionCreators/mineActionCreator';
import { Button } from 'antd';

export class Home extends Component {

  handleButtonClick() {
    this.props.createMineRecord();
  }

  render() {
    return (
      <div>
        <Button 
          className="btn-center"
          type="primary" 
          size="large" 
          onClick={() => this.handleButtonClick()}
        >
          Say Hello!
        </Button>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    createMineRecord
  }, dispatch);
}

export default connect(null, mapDispatchToProps)(Home);

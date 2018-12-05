import React, { Component } from 'react';
import * as router from '@/constants/routes';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { StaticRouter } from 'react-router'
import { Button } from 'antd';


const propTypes = {
  id: PropTypes.string,
};

const defaultProps = {
  id: ''
};

export class MapPopup extends Component {
  render() {
    return (
      <StaticRouter context={this.context} basename={process.env.BASE_PATH}>
        <Link to={router.MINE_SUMMARY.dynamicRoute(this.props.id)}>
          <Button type="primary">
          View Mine
          </Button>
        </Link>
      </StaticRouter>
    );
  }
}

MapPopup.propTypes = propTypes;
MapPopup.defaultProps = defaultProps;

export default MapPopup;
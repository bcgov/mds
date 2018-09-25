/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import NullScreen from '@/components/common/NullScreen';

const propTypes = {
  mine: PropTypes.object.isRequired,
};

const defaultProps = {
  mine: {},
};

class MineSummary extends Component {
  render() {
    const { mine } = this.props;
    if (!mine.mgr_appointment[0]) {
      return (<NullScreen type="generic" />);
    }
    return (
      <div>
        <Card>
          <table>
            <tbody>
              <tr>
                <th scope="col"><h4>Mine Manager</h4></th>
                <th scope="col"><h4>Email</h4></th>
                <th scope="col"><h4>Manager Since</h4></th>
              </tr>
              <tr>
                <td data-label="Mine Manager"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].full_name : "-"}</p></td>
                <td data-label="Email"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].full_name : "-"}</p></td>
                <td data-label="Manager Since"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].effective_date : "-"}</p></td>
              </tr>
              <tr>
                <th scope="col"><h4>Permittee</h4></th>
                <th scope="col"><h4>Permittee Since</h4></th>
              </tr>
              <tr>
                <td data-label="Permittee"><p className="p-large">N/A</p></td>
                <td data-label="Permittee Since"><p className="p-large">N/A</p></td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    );
  }
}

MineSummary.propTypes = propTypes;
MineSummary.defaultProps = defaultProps;

export default MineSummary;

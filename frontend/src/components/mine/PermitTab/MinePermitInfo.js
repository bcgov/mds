import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import NullScreen from '@/components/common/NullScreen'; 
/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mine: PropTypes.object.isRequired
};

const defaultProps = {
  mine: {},
};

class MinePermitInfo extends Component {
  render() {
    const { mine } = this.props;
    if (mine.mine_permit.length === 0) {
      return (
        <div>
          <NullScreen type="permit" />
        </div>
      )
    }
    return (
      <div>
        <Card>
          <table>
            <tbody>
            <tr>
              <th scope="col"><h4>Permit</h4></th>
              <th scope="col"><h4>Date Issued</h4></th>
            </tr>
              {mine.mine_permit.map((permit) => {
                return (
                  <tr key={permit.permit_guid}>
                    <td data-label="Permit"><p className="p-large">{permit.permit_no}</p></td>
                    <td data-label="Date Issued"><p className="p-large">{permit.issue_date}</p></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </div>
    );
  }
}

MinePermitInfo.propTypes = propTypes;
MinePermitInfo.defaultProps = defaultProps;
export default MinePermitInfo;
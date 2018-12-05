import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import NullScreen from '@/components/common/NullScreen';
/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */

const propTypes = {
  mine: PropTypes.object.isRequired,
  permittees: PropTypes.object,
  permitteeIds: PropTypes.array
};

const defaultProps = {
  mine: {},
};

class MineSummary extends Component {
  render() {
    const { mine, permittees, permitteeIds } = this.props;
    if (!mine.mgr_appointment[0] && !mine.mine_permit[0]) {
      return (<NullScreen type="generic" />);
    }

    return (
      <div>
        <Card>
          <table>
            {mine.mgr_appointment[0] && (
              <tbody>
                <tr>
                  <th scope="col"><h4>Mine Manager</h4></th>
                  <th scope="col"><h4>Email</h4></th>
                  <th scope="col"><h4>Manager Since</h4></th>
                </tr>
                <tr>
                  <td data-label="Mine Manager"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].name : "-"}</p></td>
                  <td data-label="Email"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].email : "-"}</p></td>
                  <td data-label="Manager Since"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].effective_date : "-"}</p></td>
                </tr>
              </tbody>
)}
            {mine.mine_permit[0] && (
              <tbody>
                <tr>
                  <th scope="col"><h4>Permittee</h4></th>
                  <th scope="col"><h4>Email</h4></th>
                  <th scope="col"><h4>Permittee Since</h4></th>
                </tr>
                {permitteeIds.map((id) => (
                  <tr key={id}>
                    <td data-label="Permittee"><p className="p-large">{permittees[id].party.name}</p></td>
                    <td data-label="Email"><p className="p-large">{permittees[id].party.email}</p></td>
                    <td data-label="Effective Date"><p className="p-large">{permittees[id].effective_date}</p></td>
                  </tr>
                        ))}
              </tbody>
)}
          </table>
        </Card>
        {mine.mine_permit[0] && (
        <Card>
          <table>
            <tbody>
              <tr>
                <th scope="col"><h4>Permit</h4></th>
                <th scope="col"><h4>Date Issued</h4></th>
              </tr> 
              {mine.mine_permit.map((permit) => (
                <tr key={permit.permit_guid}>
                  <td data-label="Permit"><p className="p-large">{permit.permit_no}</p></td>
                  <td data-label="Date Issued"><p className="p-large">{permit.issue_date}</p></td>
                </tr>
                  ))
                }
            </tbody>
          </table>
        </Card>
)}
      </div>
    );
  }
}

MineSummary.propTypes = propTypes;
MineSummary.defaultProps = defaultProps;

export default MineSummary;

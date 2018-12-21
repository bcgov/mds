import React from "react";
import { objectOf, arrayOf, string } from "prop-types";
import { Card } from "antd";
import { uniqBy } from "lodash";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
/**
 * @class MineSummary.js contains all content located under the 'Summary' tab on the MineDashboard.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  permittees: objectOf(CustomPropTypes.permittee),
  permitteeIds: arrayOf(string),
};

const defaultProps = {
  permittees: {},
  permitteeIds: [],
};

const MineSummary = (props) => {
  if (!props.mine.mine_permit[0]) {
    return <NullScreen type="generic" />;
  }

  const uniquePermits = uniqBy(props.mine.mine_permit, "permit_no");

  return (
    <div>
      <Card>
        <table>
          {props.mine.mine_permit[0] && (
            <tbody>
              <tr>
                <th scope="col">
                  <h4>Permittee</h4>
                </th>
                <th scope="col">
                  <h4>Email</h4>
                </th>
                <th scope="col">
                  <h4>Permittee Since</h4>
                </th>
              </tr>
              {props.permitteeIds.map((id) => (
                <tr key={id}>
                  <td data-label="Permittee">
                    <p className="p-large">{props.permittees[id].party.name}</p>
                  </td>
                  <td data-label="Email">
                    <p className="p-large">{props.permittees[id].party.email}</p>
                  </td>
                  <td data-label="Effective Date">
                    <p className="p-large">{props.permittees[id].effective_date}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </Card>
      {props.mine.mine_permit[0] && (
        <Card>
          <table>
            <tbody>
              <tr>
                <th scope="col">
                  <h4>Permit</h4>
                </th>
                <th scope="col">
                  <h4>Last Amended</h4>
                </th>
              </tr>
              {uniquePermits.map((permit) => (
                <tr key={permit.permit_guid}>
                  <td data-label="Permit">
                    <p className="p-large">{permit.permit_no}</p>
                  </td>
                  <td data-label="Date Issued">
                    <p className="p-large">{permit.issue_date}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

MineSummary.propTypes = propTypes;
MineSummary.defaultProps = defaultProps;

export default MineSummary;

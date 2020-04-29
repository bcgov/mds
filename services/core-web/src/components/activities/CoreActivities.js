import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  fetchCoreActivities,
  fetchUserCoreActivities,
} from "@common/actionCreators/activityActionCreator";
import { getCoreActivities } from "@common/selectors/activitySelectors";
import { Badge } from "antd";

import { chain } from "lodash";

const propTypes = {
  fetchUserCoreActivities: PropTypes.func.isRequired,
  fetchCoreActivities: PropTypes.func.isRequired,
  coreActivities: PropTypes.any,
};

const verbStatuses = {
  DEL: "error",
  MOD: "processing",
  ADD: "success",
  ASN: "warning",
};

const getBadgeStatus = (verb) => verbStatuses[verb];

export class CoreActivities extends Component {
  componentWillMount = () => {
    this.props.fetchCoreActivities({ publishedSince: "2020-04-01" });
  };

  render = () => {
    const groupedActivities = chain(this.props.coreActivities)
      .groupBy("published_date")
      .map((value, key) => ({ date: key, activities: value }))
      .value();
    return (
      <div style={{ padding: "20px" }}>
        {groupedActivities.map((group) => (
          <React.Fragment>
            <h3>{group.date}</h3>
            <div>
              {group.activities.map((activity) => (
                <Badge
                  status={getBadgeStatus(activity.core_activity_verb_code)}
                  text={
                    <a
                      href={activity.link}
                      style={{ color: "rgba(0, 0, 0, 0.65)", textDecoration: "none" }}
                    >
                      {activity.title}
                    </a>
                  }
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };
}

CoreActivities.propTypes = propTypes;
const mapStateToProps = (state) => ({
  coreActivities: getCoreActivities(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchCoreActivities,
      fetchUserCoreActivities,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(CoreActivities);

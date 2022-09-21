import React, { Component } from "react";
import { Link } from "react-router-dom";
import { bindActionCreators } from "redux";
import { Button } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { fetchProjectsByMine } from "@common/actionCreators/projectActionCreator";
import { getMines, getMineGuid } from "@common/selectors/mineSelectors";
import { getProjectSummaryStatusCodesHash } from "@common/selectors/staticContentSelectors";
import { getProjects } from "@common/selectors/projectSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import MineProjectTable from "./MineProjectTable";
import * as routes from "@/constants/routes";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  projects: PropTypes.arrayOf(CustomPropTypes.projectSummary).isRequired,
  fetchProjectsByMine: PropTypes.func.isRequired,
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class MineProject extends Component {
  state = {
    isLoaded: false,
  };

  componentDidMount() {
    this.props.fetchProjectsByMine({ mineGuid: this.props.mineGuid }).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  render() {
    const mine = this.props.mines[this.props.mineGuid];
    return (
      <div className="tab__content">
        <div className="inline-flex between">
          <div>
            <h2>Major Projects</h2>
          </div>
          <div>
            <AuthorizationWrapper permission={Permission.EDIT_MINES}>
              <Link to={routes.ADD_PROJECT_SUMMARY.dynamicRoute(this.props.mineGuid)}>
                <Button type="primary">Create New Project</Button>
              </Link>
            </AuthorizationWrapper>
          </div>
        </div>
        <br />
        <div>
          <MineProjectTable
            isLoaded={this.state.isLoaded}
            projects={this.props.projects}
            mine={mine}
            projectSummaryStatusCodesHash={this.props.projectSummaryStatusCodesHash}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  mineGuid: getMineGuid(state),
  projects: getProjects(state),
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchProjectsByMine,
    },
    dispatch
  );

MineProject.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineProject);

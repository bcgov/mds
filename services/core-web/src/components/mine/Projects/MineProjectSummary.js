import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  fetchProjectSummariesByMine,
  removeDocumentFromProjectSummary,
} from "@common/actionCreators/projectActionCreator";
import { getMines, getMineGuid } from "@common/selectors/mineSelectors";
import { getProjectSummaryStatusCodesHash } from "@common/selectors/staticContentSelectors";
import { getProjectSummaries } from "@common/selectors/projectSelectors";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import * as Permission from "@/constants/permissions";
import { USER_ROLES } from "@common/constants/environment";
import CustomPropTypes from "@/customPropTypes";
import MineProjectSummaryTable from "./MineProjectSummaryTable";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  projectSummaries: PropTypes.arrayOf(CustomPropTypes.projectSummary).isRequired,
  fetchProjectSummariesByMine: PropTypes.func.isRequired,
  removeDocumentFromProjectSummary: PropTypes.func.isRequired,
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class MineProjectSummary extends Component {
  state = {
    isLoaded: false,
  };

  componentDidMount() {
    this.props.fetchProjectSummariesByMine({ mineGuid: this.props.mineGuid }).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  handleRemoveDocument = (event, documentPayload) => {
    event.preventDefault();
    const { projectSummaryGuid, projectGuid, mineDocumentGuid } = documentPayload;
    return this.props
      .removeDocumentFromProjectSummary(projectGuid, projectSummaryGuid, mineDocumentGuid)
      .then(() => {
        this.setState({ isLoaded: false });
        this.props.fetchProjectSummariesByMine({ mineGuid: this.props.mineGuid });
      })
      .finally(() => this.setState({ isLoaded: true }));
  };

  render() {
    const mine = this.props.mines[this.props.mineGuid];
    const deleteFilePermission = this.props.userRoles.includes(
      USER_ROLES[Permission.EDIT_PROJECT_SUMMARIES]
    )
      ? Permission.EDIT_PROJECT_SUMMARIES
      : Permission.ADMIN;
    return (
      <div className="tab__content">
        <div>
          <h2>Major Projects</h2>
          <br />
        </div>
        <div>
          <MineProjectSummaryTable
            isLoaded={this.state.isLoaded}
            projectSummaries={this.props.projectSummaries}
            mine={mine}
            projectSummaryStatusCodesHash={this.props.projectSummaryStatusCodesHash}
            deleteFilePermission={deleteFilePermission}
            handleDeleteFile={this.handleRemoveDocument}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  mineGuid: getMineGuid(state),
  projectSummaries: getProjectSummaries(state),
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
  userRoles: getUserAccessData(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchProjectSummariesByMine,
      removeDocumentFromProjectSummary,
    },
    dispatch
  );

MineProjectSummary.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineProjectSummary);

import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
// import { Divider } from "antd";
// import moment from "moment";
import { fetchProjectSummariesByMine } from "@common/actionCreators/projectSummaryActionCreator";
import { getMines, getMineGuid } from "@common/selectors/mineSelectors";
import { getProjectSummaryStatusCodesHash } from "@common/selectors/staticContentSelectors";
import { getProjectSummaries } from "@common/selectors/projectSummarySelectors";
// import * as Strings from "@common/constants/strings";
// import * as ModalContent from "@/constants/modalContent";
// import { modalConfig } from "@/components/modalContent/config";
// import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
// import AddButton from "@/components/common/buttons/AddButton";
// import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import MineProjectSummaryTable from "./MineProjectSummaryTable";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  projectSummaries: PropTypes.arrayOf(CustomPropTypes.projectSummary).isRequired,
  fetchProjectSummariesByMine: PropTypes.func.isRequired,
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

  render() {
    const mine = this.props.mines[this.props.mineGuid];
    return (
      <div className="tab__content">
        <div>
          <h2>Pre-applications</h2>
        </div>
        <div>
          <MineProjectSummaryTable
            isLoaded={this.state.isLoaded}
            projectSummaries={this.props.projectSummaries}
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
  projectSummaries: getProjectSummaries(state),
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchProjectSummariesByMine,
    },
    dispatch
  );

MineProjectSummary.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineProjectSummary);

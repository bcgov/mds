import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  fetchMineReports,
  updateMineReport,
  createMineReport,
  deleteMineReport,
} from "@/actionCreators/reportActionCreator";
import AddButton from "@/components/common/AddButton";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { getMineReports } from "@/selectors/reportSelectors";
import { getMines, getMineGuid } from "@/selectors/mineSelectors";
import { openModal, closeModal } from "@/actions/modalActions";

/**
 * @class  MineReportInfo - contains all permit information
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  fetchMineReports: PropTypes.func.isRequired,
  updateMineReport: PropTypes.func.isRequired,
  createMineReport: PropTypes.func.isRequired,
  deleteMineReport: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class MineReportInfo extends Component {
  state = {
    mine: {},
  };

  componentWillMount = () => {
    this.props.fetchMineReports(this.props.mineGuid);
  };

  componentDidMount() {
    this.setState({ mine: this.props.mines[this.props.mineGuid] });
    console.log(this.state.mine);
  }

  handleEditReport = (values) => {
    this.props
      .updateMineReport(this.props.mineGuid, values.mine_report_guid, values)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(this.props.mineGuid));
  };

  handleAddReport = (values) => {
    this.props
      .createMineReport(this.props.mineGuid, values)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(this.props.mineGuid));
  };

  handleRemoveReport = (reportGuid) => {
    this.props
      .deleteMineReport(this.props.mineGuid, reportGuid)
      .then(() => this.props.fetchMineReports(this.props.mineGuid));
  };

  openAddReportModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddReport,
        title: `Add report for ${this.state.mine.mine_name}`,
        mineGuid: this.props.mineGuid,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  openEditReportModal = (event, onSubmit, report) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: report,
        onSubmit,
        title: `Edit report for ${this.state.mine.mine_name}`,
        mineGuid: this.props.mineGuid,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  render() {
    return (
      <div className="tab__content">
        <div className="inline-flex flex-end">
          <AuthorizationWrapper permission={Permission.EDIT_REPORTS}>
            <AddButton
              onClick={(event) =>
                this.openAddReportModal(
                  event,
                  this.handleAddReport,
                  `${ModalContent.ADD_REPORT} to ${this.state.mine.mine_name}`
                )
              }
            >
              Add a Report
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <MineReportTable
          openEditReportModal={this.openEditReportModal}
          handleEditReport={this.handleEditReport}
          handleRemoveReport={this.handleRemoveReport}
          mineReports={this.props.mineReports}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineReports: getMineReports(state),
  mines: getMines(state),
  mineGuid: getMineGuid(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReports,
      updateMineReport,
      createMineReport,
      deleteMineReport,
      openModal,
      closeModal,
    },
    dispatch
  );

MineReportInfo.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineReportInfo);

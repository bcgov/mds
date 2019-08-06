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

/**
 * @class  MineReportInfo - contains all permit information
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  fetchMineReports: PropTypes.func.isRequired,
  updateMineReport: PropTypes.func.isRequired,
  createMineReport: PropTypes.func.isRequired,
  deleteMineReport: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class MineReportInfo extends Component {
  componentWillMount = () => {
    this.props.fetchMineReports(this.props.mine.mine_guid);
  };

  handleEditReport = (values) => {
    this.props
      .updateMineReport(this.props.mine.mine_guid, values.mine_report_guid, values)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(this.props.mine.mine_guid));
  };

  handleAddReport = (values) => {
    this.props
      .createMineReport(this.props.mine.mine_guid, values)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(this.props.mine.mine_guid));
  };

  handleRemoveReport = (reportGuid) => {
    this.props
      .deleteMineReport(this.props.mine.mine_guid, reportGuid)
      .then(() => this.props.fetchMineReports(this.props.mine.mine_guid));
  };

  openAddReportModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddReport,
        title: `Add report for ${this.props.mine.mine_name}`,
        mineGuid: this.props.mine.mine_guid,
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
        title: `Edit report for ${this.props.mine.mine_name}`,
        mineGuid: this.props.mine.mine_guid,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  render() {
    return (
      <div>
        <div className="inline-flex flex-end">
          <AuthorizationWrapper
            permission={Permission.EDIT_REPORTS}
            isMajorMine={this.props.mine.major_mine_ind}
          >
            <AddButton
              onClick={(event) =>
                this.openAddReportModal(
                  event,
                  this.handleAddReport,
                  `${ModalContent.ADD_REPORT} to ${this.props.mine.mine_name}`
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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReports,
      updateMineReport,
      createMineReport,
      deleteMineReport,
    },
    dispatch
  );

MineReportInfo.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineReportInfo);

import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Divider } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as ModalContent from "@/constants/modalContent";
import * as Permission from "@/constants/permissions";
import {
  fetchMineReports,
  updateMineReport,
  deleteMineReport,
} from "@/actionCreators/reportActionCreator";
import {
  fetchExpectedDocumentStatusOptions,
  fetchMineTailingsRequiredDocuments,
} from "@/actionCreators/staticContentActionCreator";
import {
  getExpectedDocumentStatusOptions,
  getMineTSFRequiredReports,
} from "@/selectors/staticContentSelectors";
import { getMineReports, getMineTSFReports } from "@/selectors/reportSelectors";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import { getMines, getMineGuid } from "@/selectors/mineSelectors";
import { openModal, closeModal } from "@/actions/modalActions";

/**
 * @class  MineTailingsInfo - all tenure information related to the mine.
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineTSFReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  updateMineReport: PropTypes.func.isRequired,
  deleteMineReport: PropTypes.func.isRequired,
  fetchMineReports: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class MineTailingsInfo extends Component {
  state = { selectedDocument: {} };

  componentDidMount() {}

  handleEditReport = (values) => {
    this.props
      .updateMineReport(this.props.mineGuid, values.mine_report_guid, values)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(this.props.mineGuid));
  };

  handleRemoveReport = (reportGuid) => {
    this.props
      .deleteMineReport(this.props.mineGuid, reportGuid)
      .then(() => this.props.fetchMineReports(this.props.mineGuid));
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
    const mine = this.props.mines[this.props.mineGuid];
    return (
      <div className="tab__content">
        <div>
          <h2>Tailings</h2>
          <Divider />
        </div>
        {mine.mine_tailings_storage_facilities.map((facility) => (
          <Row
            key={facility.mine_tailings_storage_facility_guid}
            gutter={16}
            style={{ marginBottom: "10px" }}
          >
            <Col span={6}>
              <h3>{facility.mine_tailings_storage_facility_name}</h3>
              <p>No TSF registry data available</p>
            </Col>
          </Row>
        ))}
        <br />
        <br />
        <div>
          <div className="inline-flex between">
            <div>
              <h3>Reports</h3>
            </div>
          </div>
          <MineReportTable
            mineReports={this.props.mineTSFReports}
            openEditReportModal={this.openEditReportModal}
            handleEditReport={this.handleEditReport}
            handleRemoveReport={this.removeReport}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineTSFReports: getMineTSFReports(state),
  mines: getMines(state),
  mineGuid: getMineGuid(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReports,
      updateMineReport,
      deleteMineReport,
      openModal,
      closeModal,
    },
    dispatch
  );

MineTailingsInfo.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineTailingsInfo);

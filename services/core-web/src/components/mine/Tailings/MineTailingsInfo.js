import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Divider } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import {
  fetchMineReports,
  updateMineReport,
  deleteMineReport,
} from "@/actionCreators/reportActionCreator";
import { getMineReports } from "@/selectors/reportSelectors";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import { getMines, getMineGuid } from "@/selectors/mineSelectors";
import { openModal, closeModal } from "@/actions/modalActions";
import { getMineReportDefinitionOptions } from "@/reducers/staticContentReducer";

/**
 * @class  MineTailingsInfo - all tenure information related to the mine.
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  updateMineReport: PropTypes.func.isRequired,
  deleteMineReport: PropTypes.func.isRequired,
  fetchMineReports: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class MineTailingsInfo extends Component {
  state = { mine: {}, isLoaded: false };

  componentDidMount() {
    this.setState({ mine: this.props.mines[this.props.mineGuid] });
    this.props.fetchMineReports(this.props.mineGuid).then(() => {
      this.setState({ isLoaded: true });
    });
  }

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

    const filteredReportDefinitionGuids =
      this.props.mineReportDefinitionOptions &&
      this.props.mineReportDefinitionOptions
        .filter((option) =>
          option.categories.map((category) => category.mine_report_category).includes("TSF")
        )
        .map((definition) => definition.mine_report_definition_guid);

    const filteredReports =
      this.props.mineReports &&
      this.props.mineReports.filter((report) =>
        filteredReportDefinitionGuids.includes(report.mine_report_definition_guid.toLowerCase())
      );

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
            isLoaded={this.state.isLoaded}
            mineReports={filteredReports}
            openEditReportModal={this.openEditReportModal}
            handleEditReport={this.handleEditReport}
            handleRemoveReport={this.handleRemoveReport}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineReports: getMineReports(state),
  mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
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

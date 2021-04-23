import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import PropTypes from "prop-types";
import { Divider, Tabs } from "antd";
import {
  fetchMineReports,
  updateMineReport,
  deleteMineReport,
} from "@common/actionCreators/reportActionCreator";
import {
  fetchMineRecordById,
  createTailingsStorageFacility,
} from "@common/actionCreators/mineActionCreator";
import { getMineReports } from "@common/selectors/reportSelectors";
import { getMines, getMineGuid } from "@common/selectors/mineSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getMineReportDefinitionOptions } from "@common/reducers/staticContentReducer";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@common/constants/strings";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import MineTailingsMap from "@/components/maps/MineTailingsMap";
import MineTailingsTable from "@/components/mine/Tailings/MineTailingsTable";
import AddButton from "@/components/common/AddButton";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

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
  createTailingsStorageFacility: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
};

const defaultParams = {
  mineReportType: Strings.MINE_REPORTS_TYPE.tailingsReports,
};

export class MineTailingsInfo extends Component {
  state = { mine: {}, isLoaded: false, params: { sort_field: "received_date", sort_dir: "desc" } };

  componentDidMount() {
    this.setState({ mine: this.props.mines[this.props.mineGuid] });
    this.props.fetchMineReports(this.props.mineGuid, defaultParams.mineReportType).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  handleEditReport = (report) => {
    return this.props
      .updateMineReport(report.mine_guid, report.mine_report_guid, report)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(report.mine_guid, defaultParams.mineReportType));
  };

  handleRemoveReport = (report) => {
    return this.props
      .deleteMineReport(report.mine_guid, report.mine_report_guid)
      .then(() => this.props.fetchMineReports(report.mine_guid, defaultParams.mineReportType));
  };

  openEditReportModal = (event, onSubmit, report) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: report,
        onSubmit,
        title: `Edit report for ${this.state.mine.mine_name}`,
        mineGuid: this.props.mineGuid,
        mineReportsType: Strings.MINE_REPORTS_TYPE.tailingsReports,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  handleReportFilterSubmit = (params) => {
    this.setState({ params: { sort_field: params.sort_field, sort_dir: params.sort_dir } });
  };

  handleAddTailings = (values) => {
    return this.props
      .createTailingsStorageFacility(this.props.mineGuid, values)
      .then(() => {
        this.props.fetchMineRecordById(this.props.mineGuid);
      })
      .finally(this.props.closeModal());
  };

  openTailingsModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title },
      content: modalConfig.ADD_TAILINGS,
    });
  }

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
      this.props.mineReports.filter(
        (report) =>
          report.mine_report_definition_guid &&
          filteredReportDefinitionGuids.includes(report.mine_report_definition_guid.toLowerCase())
      );

    return (
      <div className="tab__content">
        <div>
          <h2>Tailings</h2>
          <Divider />
        </div>
        <Tabs type="card" style={{ textAlign: "left !important" }}>
          <Tabs.TabPane tab="Tailing Storage Facilities" key="tsf">
            <div>
              <br />
              <div className="inline-flex between">
                <h4 className="uppercase">Tailing Storage Facilities</h4>
                <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                  <AddButton
                    onClick={(event) =>
                      this.openTailingsModal(event, this.handleAddTailings, "Add TSF")
                    }
                  >
                    Add TSF
                  </AddButton>
                </AuthorizationWrapper>
              </div>
              <MineTailingsTable
                tailings={mine.mine_tailings_storage_facilities}
                isLoaded={this.state.isLoaded}
              />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Map" key="map">
            <div>
              <br />
              <h4 className="uppercase">Map</h4>
              <br />
              <LoadingWrapper condition={this.state.isLoaded}>
                <MineTailingsMap mine={mine} tailings={mine.mine_tailings_storage_facilities} />
              </LoadingWrapper>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Tailings Reports" key="reports">
            <div>
              <br />
              <h4 className="uppercase">Reports</h4>
              <br />
              <MineReportTable
                isLoaded={this.state.isLoaded}
                mineReports={filteredReports}
                openEditReportModal={this.openEditReportModal}
                handleEditReport={this.handleEditReport}
                handleRemoveReport={this.handleRemoveReport}
                handleTableChange={this.handleReportFilterSubmit}
                sortField={this.state.params.sort_field}
                sortDir={this.state.params.sort_dir}
                mineReportType={Strings.MINE_REPORTS_TYPE.codeRequiredReports}
              />
            </div>
          </Tabs.TabPane>
        </Tabs>
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
      createTailingsStorageFacility,
      fetchMineRecordById,
      openModal,
      closeModal,
    },
    dispatch
  );

MineTailingsInfo.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineTailingsInfo);

import React, { FC, useEffect, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider, Tabs } from "antd";
import {
  deleteMineReport,
  fetchMineReports,
  updateMineReport,
} from "@common/actionCreators/reportActionCreator";
import {
  createTailingsStorageFacility,
  fetchMineRecordById,
  updateTailingsStorageFacility,
} from "@common/actionCreators/mineActionCreator";
import {
  getConsequenceClassificationStatusCodeOptionsHash,
  getITRBExemptionStatusCodeOptionsHash,
  getTSFOperatingStatusCodeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { getMineReports } from "@common/selectors/reportSelectors";
import { getMineGuid, getMines } from "@common/selectors/mineSelectors";
import { closeModal, openModal } from "@common/actions/modalActions";
import { getMineReportDefinitionOptions } from "@common/reducers/staticContentReducer";
import * as Strings from "@common/constants/strings";
import DamsPage from "@common/components/tailings/dam/DamsPage";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import MineTailingsMap from "@/components/maps/MineTailingsMap";
import MineTailingsTable from "@/components/mine/Tailings/MineTailingsTable";
import AddButton from "@/components/common/buttons/AddButton";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { SMALL_PIN, SMALL_PIN_SELECTED } from "@/constants/assets";
import TailingsSummaryPageWrapper from "./TailingsSummaryPageWrapper";
import { IMine, IMineReport } from "@mds/common";
import { ActionCreator } from "@/interfaces/actionCreator";

/**
 * @class  MineTailingsInfoTabs - all tenure information related to the mine.
 */

interface MineTailingsInfoTabsProps {
  mines: IMine[];
  mineGuid: string;
  mineReports: IMineReport[];
  mineReportDefinitionOptions: any[];
  updateMineReport: ActionCreator<typeof updateMineReport>;
  deleteMineReport: ActionCreator<typeof deleteMineReport>;
  fetchMineReports: ActionCreator<typeof fetchMineReports>;
  openModal: typeof openModal;
  closeModal: typeof closeModal;
  createTailingsStorageFacility: ActionCreator<typeof createTailingsStorageFacility>;
  updateTailingsStorageFacility: ActionCreator<typeof updateTailingsStorageFacility>;
  fetchMineRecordById: ActionCreator<typeof fetchMineRecordById>;
  TSFOperatingStatusCodeHash: any;
  consequenceClassificationStatusCodeHash: any;
  itrbExemptionStatusCodeHash: any;
  enabledTabs: string[];
}

const defaultParams = {
  mineReportType: Strings.MINE_REPORTS_TYPE.tailingsReports,
};

export const MineTailingsInfoTabs: FC<MineTailingsInfoTabsProps> = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mine, setMine] = useState<IMine>({});
  const [params, setParams] = useState({ sort_field: "received_date", sort_dir: "desc" });

  useEffect(() => {
    setMine(props.mines[props.mineGuid]);
    props.fetchMineReports(props.mineGuid, defaultParams.mineReportType).then(() => {
      setIsLoaded(true);
    });
  }, []);

  const handleEditReport = (report) => {
    return props
      .updateMineReport(report.mine_guid, report.mine_report_guid, report)
      .then(() => props.closeModal())
      .then(() => props.fetchMineReports(report.mine_guid, defaultParams.mineReportType));
  };

  const handleEditTailings = (values) => {
    return props
      .updateTailingsStorageFacility(
        values.mine_guid,
        values.mine_tailings_storage_facility_guid,
        values
      )
      .then(() => {
        props.fetchMineRecordById(props.mineGuid);
        props.fetchMineReports(props.mineGuid, defaultParams.mineReportType);
      })
      .then(() => props.closeModal());
  };

  const handleRemoveReport = (report) => {
    return props
      .deleteMineReport(report.mine_guid, report.mine_report_guid)
      .then(() => props.fetchMineReports(report.mine_guid, defaultParams.mineReportType));
  };

  const openEditReportModal = (event, onSubmit, report) => {
    event.preventDefault();
    props.openModal({
      props: {
        initialValues: report,
        onSubmit,
        title: `Edit report for ${mine.mine_name}`,
        mineGuid: props.mineGuid,
        mineReportsType: Strings.MINE_REPORTS_TYPE.tailingsReports,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  const openEditTailingsModal = (event, onSubmit, record) => {
    const initialPartyValue = {
      value: record.engineer_of_record?.party_guid,
      label: record.engineer_of_record?.party.name,
    };

    event.preventDefault();
    props.openModal({
      props: {
        initialValues: record,
        initialPartyValue,
        onSubmit,
        title: `Edit ${record.mine_tailings_storage_facility_name}`,
      },
      content: modalConfig.ADD_TAILINGS,
    });
  };

  const handleReportFilterSubmit = (filterParams) => {
    setParams({ sort_field: filterParams.sort_field, sort_dir: filterParams.sort_dir });
  };

  const handleAddTailings = (values) => {
    return props
      .createTailingsStorageFacility(props.mineGuid, values)
      .then(() => {
        props.fetchMineRecordById(props.mineGuid);
        props.fetchMineReports(props.mineGuid, defaultParams.mineReportType);
      })
      .finally(() => {
        props.closeModal();
        setIsLoaded(false);
      });
  };

  const openTailingsModal = (event, onSubmit, title) => {
    event.preventDefault();
    props.openModal({
      props: { onSubmit, title, initialPartyValue: {} },
      content: modalConfig.ADD_TAILINGS,
    });
  };

  const filteredReportDefinitionGuids =
    props.mineReportDefinitionOptions &&
    props.mineReportDefinitionOptions
      .filter((option) =>
        option.categories.map((category) => category.mine_report_category).includes("TSF")
      )
      .map((definition) => definition.mine_report_definition_guid);

  const filteredReports =
    props.mineReports &&
    props.mineReports.filter(
      (report) =>
        report.mine_report_definition_guid &&
        filteredReportDefinitionGuids.includes(report.mine_report_definition_guid.toLowerCase())
    );

  const tabEnabled = (tab) => !!props.enabledTabs?.includes(tab);

  return (
    <div className="tab__content">
      <div>
        <h2>Tailings Storage Facilities</h2>
        <Divider />
      </div>
      {/*@ts-ignore*/}
      <Tabs type="card" style={{ textAlign: "left !important" }}>
        {tabEnabled("tsfDetails") && (
          <Tabs.TabPane
            tab={`Tailings Storage Facilities (${mine.mine_tailings_storage_facilities?.length})`}
            key="tsfDetails"
          >
            <TailingsSummaryPageWrapper />
          </Tabs.TabPane>
        )}
        {tabEnabled("dam") && (
          <Tabs.TabPane
            tab={`Tailings Storage Facilities (${mine.mine_tailings_storage_facilities?.length})`}
            key="dam"
          >
            {/*@ts-ignore*/}
            <DamsPage />
          </Tabs.TabPane>
        )}
        {tabEnabled("tsf") && (
          <Tabs.TabPane
            tab={`Tailings Storage Facilities (${mine.mine_tailings_storage_facilities?.length})`}
            key="tsf"
          >
            <div>
              <br />
              <div className="inline-flex between">
                <h4 className="uppercase">Tailings Storage Facilities</h4>
                <AuthorizationWrapper permission={Permission.EDIT_TSF}>
                  <AddButton
                    onClick={(event) => openTailingsModal(event, handleAddTailings, "Add TSF")}
                  >
                    Add TSF
                  </AddButton>
                </AuthorizationWrapper>
              </div>
              <MineTailingsTable
                tailings={mine.mine_tailings_storage_facilities}
                isLoaded={isLoaded}
                openEditTailingsModal={openEditTailingsModal}
                handleEditTailings={handleEditTailings}
              />
            </div>
          </Tabs.TabPane>
        )}
        {tabEnabled("reports") && (
          <Tabs.TabPane tab="Tailings Reports" key="reports">
            <div>
              <br />
              <h4 className="uppercase">Reports</h4>
              <br />
              <MineReportTable
                isLoaded={isLoaded}
                mineReports={filteredReports}
                openEditReportModal={openEditReportModal}
                handleEditReport={handleEditReport}
                handleRemoveReport={handleRemoveReport}
                handleTableChange={handleReportFilterSubmit}
                sortField={params.sort_field}
                sortDir={params.sort_dir}
                mineReportType={Strings.MINE_REPORTS_TYPE.codeRequiredReports}
              />
            </div>
          </Tabs.TabPane>
        )}

        {tabEnabled("map") && (
          <Tabs.TabPane tab="Map" key="map">
            <div>
              <br />
              <h4 className="uppercase">Map</h4>
              <div className="inline-flex">
                <p>
                  <img
                    src={SMALL_PIN}
                    className="icon-sm--img"
                    alt="Mine Pin"
                    style={{ marginTop: "10px" }}
                  />
                  Location of Mine Site
                </p>
                <p>
                  <img
                    src={SMALL_PIN_SELECTED}
                    className="icon-sm--img"
                    alt="TSF Pin"
                    style={{ marginTop: "10px" }}
                  />
                  Location of TSF
                </p>
              </div>
              <LoadingWrapper condition={isLoaded}>
                <MineTailingsMap
                  mine={mine}
                  tailings={mine.mine_tailings_storage_facilities}
                  TSFOperatingStatusCodeHash={props.TSFOperatingStatusCodeHash}
                  consequenceClassificationStatusCodeHash={
                    props.consequenceClassificationStatusCodeHash
                  }
                  itrbExemptionStatusCodeHash={props.itrbExemptionStatusCodeHash}
                />
              </LoadingWrapper>
            </div>
          </Tabs.TabPane>
        )}
      </Tabs>
    </div>
  );
};

const mapStateToProps = (state) => ({
  mineReports: getMineReports(state),
  mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
  mines: getMines(state),
  mineGuid: getMineGuid(state),
  TSFOperatingStatusCodeHash: getTSFOperatingStatusCodeOptionsHash(state),
  consequenceClassificationStatusCodeHash: getConsequenceClassificationStatusCodeOptionsHash(state),
  itrbExemptionStatusCodeHash: getITRBExemptionStatusCodeOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReports,
      updateMineReport,
      deleteMineReport,
      createTailingsStorageFacility,
      updateTailingsStorageFacility,
      fetchMineRecordById,
      openModal,
      closeModal,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MineTailingsInfoTabs);

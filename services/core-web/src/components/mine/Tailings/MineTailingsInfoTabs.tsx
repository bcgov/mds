import React, { FC, useEffect, useState } from "react";
import { Divider, Tabs } from "antd";
import {
  deleteMineReport,
  fetchMineReports,
} from "@mds/common/redux/actionCreators/reportActionCreator";
import {
  fetchMineRecordById,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import {
  createTailingsStorageFacility,
  fetchTsfsByMineGuid,
  getTsfsByMineGuid,
  updateTailingsStorageFacility,
} from "@mds/common/redux/slices/tailingsSlice";
import {
  getConsequenceClassificationStatusCodeOptionsHash,
  getITRBExemptionStatusCodeOptionsHash,
  getTSFOperatingStatusCodeOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getMineReports, getReportsPageData } from "@mds/common/redux/selectors/reportSelectors";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import * as Strings from "@mds/common/constants/strings";
import DamsPage from "@mds/common/components/tailings/dam/DamsPage";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import { modalConfig } from "@/components/modalContent/config";
import MineTailingsMap from "@/components/maps/MineTailingsMap";
import MineTailingsTable from "@/components/mine/Tailings/MineTailingsTable";
import AddButton from "@/components/common/buttons/AddButton";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { SMALL_PIN, SMALL_PIN_SELECTED } from "@/constants/assets";
import TailingsSummaryPageWrapper from "./TailingsSummaryPageWrapper";
import { IMine, IMineReport } from "@mds/common/interfaces";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";
import ResponsivePagination from "@mds/common/components/common/ResponsivePagination";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { useHistory, useParams } from "react-router-dom";
import { ADD_TAILINGS_STORAGE_FACILITY } from "@/constants/routes";
import { resetForm } from "@mds/common/redux/utils/helpers";
import { FORM } from "@mds/common/constants/forms";


/**
 * @class  MineTailingsInfoTabs - all tenure information related to the mine.
 */

interface MineTailingsInfoTabsProps {
  enabledTabs: string[];
}

const defaultParams = {
  mineReportType: Strings.MINE_REPORTS_TYPE.tailingsReports,
};

export const MineTailingsInfoTabs: FC<MineTailingsInfoTabsProps> = (props) => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { mineGuid } = useParams<{ mineGuid: string }>();
  const mine: IMine = useAppSelector(getMineById(mineGuid));

  const mineReports: IMineReport[] = useAppSelector(getMineReports);
  const TSFOperatingStatusCodeHash = useAppSelector(getTSFOperatingStatusCodeOptionsHash);
  const consequenceClassificationStatusCodeHash = useAppSelector(getConsequenceClassificationStatusCodeOptionsHash);
  const itrbExemptionStatusCodeHash = useAppSelector(getITRBExemptionStatusCodeOptionsHash);
  const tailings = useAppSelector(getTsfsByMineGuid(mineGuid)) ?? [];

  const pageData = useAppSelector(getReportsPageData);

  const [isLoaded, setIsLoaded] = useState(false);
  const [params, setParams] = useState({ sort_field: "received_date", sort_dir: "desc" });

  const canEditTSF = useAppSelector(userHasRole(USER_ROLES.role_edit_tsf));

  const { isFeatureEnabled } = useFeatureFlag();
  const tsfV2Enabled = isFeatureEnabled(Feature.TSF_V2);

  useEffect(() => {
    Promise.all([
      dispatch(fetchMineReports(mineGuid, defaultParams.mineReportType)),
      dispatch(fetchTsfsByMineGuid(mineGuid))
    ]).then(() => {
      setIsLoaded(true);
    });
  }, []);

  const handleEditTailings = (values) => {
    return dispatch(
      updateTailingsStorageFacility(values))
      .then(() => {
        dispatch(fetchMineReports(mineGuid, defaultParams.mineReportType, defaultParams));
      })
      .then(() => dispatch(closeModal()));
  };

  const handleRemoveReport = (report) => {
    return dispatch(
      deleteMineReport(report.mine_guid, report.mine_report_guid))
      .then(() =>
        dispatch(fetchMineReports(report.mine_guid, defaultParams.mineReportType, defaultParams))
      );
  };

  const openEditTailingsModal = (event, onSubmit, record) => {
    const initialPartyValue = {
      value: record.engineer_of_record?.party_guid,
      label: record.engineer_of_record?.party.name,
    };

    event.preventDefault();
    dispatch(openModal({
      props: {
        initialValues: record,
        initialPartyValue,
        onSubmit,
        title: `Edit ${record.mine_tailings_storage_facility_name}`,
      },
      content: modalConfig.ADD_TAILINGS,
    }));
  };

  const handleReportFilterSubmit = (filterParams) => {
    setParams({ sort_field: filterParams.sort_field, sort_dir: filterParams.sort_dir });
  };

  const handleAddTailings = (values) => {
    return dispatch(
      createTailingsStorageFacility({ mine_guid: mineGuid, ...values }))
      .then(() => {
        dispatch(fetchMineRecordById(mineGuid));
        dispatch(fetchMineReports(mineGuid, defaultParams.mineReportType, defaultParams));
      })
      .finally(() => {
        dispatch(closeModal());
        setIsLoaded(false);
      });
  };

  const onPageChange = (page, per_page) => {
    dispatch(fetchMineReports(mineGuid, defaultParams.mineReportType, {
      ...defaultParams,
      page,
      per_page,
    }));
  };

  const handleCreateTailings = async (event) => {
    if (tsfV2Enabled) {
      navigateToCreateTailings(event);
    } else {
      openTailingsModal(event, handleAddTailings, "Add TSF")
    }
  }

  const navigateToCreateTailings = async (event) => {
    event.preventDefault();
    resetForm(FORM.ADD_TAILINGS_STORAGE_FACILITY);

    const url = ADD_TAILINGS_STORAGE_FACILITY.dynamicRoute(mine.mine_guid);
    history.push(url);
  };

  const openTailingsModal = (event, onSubmit, title) => {
    event.preventDefault();
    dispatch(openModal({
      props: { onSubmit, title, initialPartyValue: {} },
      content: modalConfig.ADD_TAILINGS,
    }));
  };

  const tabItems = [
    {
      key: "tsfDetails",
      label: `Tailings Storage Facilities (${tailings.length})`,
      children: <TailingsSummaryPageWrapper />
    },
    {
      key: "dam",
      label: `Tailings Storage Facilities (${tailings.length})`,
      children: <DamsPage />
    },
    {
      key: "tsf",
      label: `Tailings Storage Facilities (${tailings.length})`,
      children: <div>
        <br />
        <div className="inline-flex between">
          <h4 className="uppercase">Tailings Storage Facilities</h4>
          {canEditTSF && (
            <AddButton
              onClick={(event) => handleCreateTailings(event)}
            >
              Add TSF
            </AddButton>
          )}
        </div>
        <MineTailingsTable
          tailings={tailings}
          isLoaded={isLoaded}
          openEditTailingsModal={openEditTailingsModal}
          handleEditTailings={handleEditTailings}
          tsfV2Enabled={tsfV2Enabled}
          canEditTSF={canEditTSF}
        />
      </div>
    },
    {
      key: "reports",
      label: "Tailings Reports",
      children: <div>
        <br />
        <h4 className="uppercase">Reports</h4>
        <br />
        <MineReportTable
          isLoaded={isLoaded}
          mineReports={mineReports}
          handleRemoveReport={handleRemoveReport}
          handleTableChange={handleReportFilterSubmit}
          sortField={params.sort_field}
          sortDir={params.sort_dir}
          mineReportType={Strings.MINE_REPORTS_TYPE.codeRequiredReports}
        />
        <div className="center">
          <ResponsivePagination
            onPageChange={onPageChange}
            currentPage={Number(pageData.current_page)}
            pageTotal={Number(pageData.total)}
            itemsPerPage={Number(pageData.items_per_page)}
          />
        </div>
      </div>
    },
    {
      key: "map",
      label: "Map",
      children: <div>
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
            tailings={tailings}
            TSFOperatingStatusCodeHash={TSFOperatingStatusCodeHash}
            consequenceClassificationStatusCodeHash={
              consequenceClassificationStatusCodeHash
            }
            itrbExemptionStatusCodeHash={itrbExemptionStatusCodeHash}
          />
        </LoadingWrapper>
      </div>
    }
  ].filter((tab) => !!props.enabledTabs.includes(tab.key));

  return (
    <div className="tab__content">
      <div>
        <h2>Tailings Storage Facilities</h2>
        <Divider />
      </div>
      <Tabs type="card" items={tabItems}>
      </Tabs>
    </div>
  );
};


export default MineTailingsInfoTabs;

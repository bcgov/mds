import React, { FC, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { change, FormSection, getFormValues } from "@mds/common/components/forms/form";
import CustomPropTypes from "@/customPropTypes";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import AccessRoads from "@/components/noticeOfWork/applications/review/activities/AccessRoads";
import Blasting from "@/components/noticeOfWork/applications/review/activities/Blasting";
import SurfaceDrilling from "@/components/noticeOfWork/applications/review/activities/SurfaceDrilling";
import Camps from "@/components/noticeOfWork/applications/review/activities/Camps";
import CutLines from "@/components/noticeOfWork/applications/review/activities/CutLines";
import MechanicalTrenching from "@/components/noticeOfWork/applications/review/activities/MechanicalTrenching";
import SettlingPonds from "@/components/noticeOfWork/applications/review/activities/SettlingPonds";
import SandGravelQuarry from "@/components/noticeOfWork/applications/review/activities/SandGravelQuarry";
import SurfaceBulkSamples from "@/components/noticeOfWork/applications/review/activities/SurfaceBulkSamples";
import WaterSupply from "@/components/noticeOfWork/applications/review/activities/WaterSupply";
import UndergroundExploration from "@/components/noticeOfWork/applications/review/activities/UndergroundExploration";
import Placer from "@/components/noticeOfWork/applications/review/activities/Placer";
import { renderActivities } from "@/constants/NOWConditions";
import Equipment from "@/components/noticeOfWork/applications/review/activities/Equipment";
import { isEmpty } from "lodash";
import { EDIT_NOTICE_OF_WORK } from "@/constants/forms";
import { useAppDispatch } from "@mds/common/redux/rootState";
import NullScreen from "@/components/common/NullScreen";
import { Button, Popconfirm } from "antd";
import { TRASHCAN } from "@/constants/assets";

/**
 * @constant ReviewActivities renders edit/view for the NoW Application review step
 */

const propTypes = {
  noticeOfWorkType: PropTypes.string.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  renderOriginalValues: PropTypes.objectOf(PropTypes.string).isRequired,
  isPreLaunch: PropTypes.bool.isRequired,
};

const ActivityWrapper: FC<{ data: any, id: string, isViewMode: boolean, title, children }> = ({ data, id, title, children, isViewMode }) => {
  const [isVisible, setIsVisible] = useState(true);
  const formValues = getFormValues(EDIT_NOTICE_OF_WORK);
  const dispatch = useAppDispatch();


  useEffect(() => {
    if (data !== undefined && !isEmpty(data)) {
      console.log('not visible', { title, isViewMode })
      setIsVisible(false);
    } else {
      console.log('visible!', { title, isViewMode })
    }
  }, [data]);

  const enableContent = () => {
    setIsVisible(true);
  };

  const clearContent = () => {
    const formSection = id.replace(/-/g, "_");
    const sectionData = formValues[formSection];

    // delete nested children of activities, if they exist
    if (sectionData?.details?.length > 0) {
      sectionData.details = sectionData.details.map((detail) => ({ ...detail, state_modified: "delete" }));
    };

    if (sectionData?.equipment?.length > 0) {
      sectionData.equipment = sectionData.equipment.map((equipment) => ({
        ...equipment,
        state_modified: "delete",
      }));
    }
    dispatch(change(EDIT_NOTICE_OF_WORK, formSection, {
      state_modified: "delete",
      ...data
    }));

    setIsVisible(false);
  };

  const renderCorrectView = () => {
    return isVisible ? (
      <span>{children}</span>
    ) : (
      <div>
        <NullScreen type="add-now-activity" message={title} />
        <div className="null-screen">
          {!isViewMode && (
            <Button type="primary" onClick={enableContent}>
              Add Activity
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    isViewMode && isVisible ? (
      <div title="remove">
        <Popconfirm
          placement="left"
          title={`Are you sure you want to remove the activity ${title}? You must save the form to commit these changes.`}
          okText="Yes"
          cancelText="No"
          onConfirm={clearContent}
        >
          <Button type="primary" size="small" ghost>
            <img src={TRASHCAN} alt="Remove Activity" />
          </Button>
        </Popconfirm>
      </div>
    ) : (renderCorrectView())
  );
};

export const ReviewActivities = (props) => {
  return (
    <div>
      <ScrollContentWrapper
        id="blasting-operation"
        title="Blasting"
      >
        <ActivityWrapper
          data={props.noticeOfWork.blasting_operation}
          isViewMode={props.isViewMode}
          title="Blasting"
          id="blasting-operation"
        >
          <FormSection name="blasting_operation">
            <Blasting
              isNewPermit={props.noticeOfWork.type_of_application === "New Permit"}
              isViewMode={props.isViewMode}
              renderOriginalValues={props.renderOriginalValues}
              isPreLaunch={props.isPreLaunch}
              mineGuid={props.noticeOfWork.mine_guid}
            />
          </FormSection>
        </ActivityWrapper>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="camp"
        title="Camps, Buildings, Staging Areas, Fuel/Lubricant Storage"
      >
        <ActivityWrapper
          id="camp"
          title="Camps, Buildings, Staging Areas, Fuel/Lubricant Storage"
          data={props.noticeOfWork.camp}
          isViewMode={props.isViewMode}
        >
          <FormSection name="camp">
            <Camps
              isViewMode={props.isViewMode}
              renderOriginalValues={props.renderOriginalValues}
              isPreLaunch={props.isPreLaunch}
            />
          </FormSection>
        </ActivityWrapper>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="mechanical-trenching"
        title="Mechanical Trenching / Test Pits"
      >
        <ActivityWrapper
          id="mechanical-trenching"
          title="Mechanical Trenching / Test Pits"
          data={props.noticeOfWork.mechanical_trenching}
          isViewMode={props.isViewMode}
        >
          <FormSection name="mechanical_trenching">
            <MechanicalTrenching
              isViewMode={props.isViewMode}
              renderOriginalValues={props.renderOriginalValues}
              isPreLaunch={props.isPreLaunch}
            />
          </FormSection>
        </ActivityWrapper>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="exploration-surface-drilling"
        title="Exploration Surface Drilling"
      >
        <ActivityWrapper
          id="exploration-surface-drilling"
          title="Exploration Surface Drilling"
          data={props.noticeOfWork.exploration_surface_drilling}
          isViewMode={props.isViewMode}
        >
          <FormSection name="exploration_surface_drilling">
            <SurfaceDrilling
              isViewMode={props.isViewMode}
              renderOriginalValues={props.renderOriginalValues}
              isPreLaunch={props.isPreLaunch}
            />
          </FormSection>
        </ActivityWrapper>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="exploration-access"
        title="Access Roads, Trails, Helipads, Air Strips, Boat Ramps"
      >
        <ActivityWrapper
          id="exploration-access"
          title="Access Roads, Trails, Helipads, Air Strips, Boat Ramps"
          data={props.noticeOfWork.exploration_access}
          isViewMode={props.isViewMode}
        >
          <FormSection name="exploration_access">
            <AccessRoads
              isViewMode={props.isViewMode}
              renderOriginalValues={props.renderOriginalValues}
              isPreLaunch={props.isPreLaunch}
            />
          </FormSection>
        </ActivityWrapper>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="surface-bulk-sample"
        title="Surface Bulk Sample"
        showContent={renderActivities(props.noticeOfWorkType, "surface-bulk-sample")}
      >
        <ActivityWrapper
          id="surface-bulk-sample"
          title="Surface Bulk Sample"
          data={props.noticeOfWork.surface_bulk_sample}
          isViewMode={props.isViewMode}
        >
          <FormSection name="surface_bulk_sample">
            <SurfaceBulkSamples
              isViewMode={props.isViewMode}
              renderOriginalValues={props.renderOriginalValues}
              isPreLaunch={props.isPreLaunch}
            />
          </FormSection>
        </ActivityWrapper>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="underground-exploration"
        title="Underground Exploration"
        showContent={renderActivities(props.noticeOfWorkType, "underground-exploration")}
      >
        <ActivityWrapper
          id="underground-exploration"
          title="Underground Exploration"
          data={props.noticeOfWork.underground_exploration}
          isViewMode={props.isViewMode}
        >
          <FormSection name="underground_exploration">
            <UndergroundExploration
              isViewMode={props.isViewMode}
              renderOriginalValues={props.renderOriginalValues}
              isPreLaunch={props.isPreLaunch}
            />
          </FormSection>
        </ActivityWrapper>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="placer-operation"
        title="Placer Operations"
        showContent={renderActivities(props.noticeOfWorkType, "placer-operation")}
      >
        <ActivityWrapper
          id="placer-operation"
          title="Placer Operations"
          data={props.noticeOfWork.placer_operation}
          isViewMode={props.isViewMode}
        >
          <FormSection name="placer_operation">
            <Placer
              isViewMode={props.isViewMode}
              renderOriginalValues={props.renderOriginalValues}
              isPreLaunch={props.isPreLaunch}
            />
          </FormSection>
        </ActivityWrapper>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="water-supply"
        title="Water Supply"
      >
        <ActivityWrapper
          id="water-supply"
          title="Water Supply"
          data={props.noticeOfWork.water_supply}
          isViewMode={props.isViewMode}
        >
          <FormSection name="water_supply">
            <WaterSupply isViewMode={props.isViewMode} />
          </FormSection>
        </ActivityWrapper>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="cut-lines-polarization-survey"
        title="Cut Lines and Induced Polarization Survey"
        showContent={renderActivities(props.noticeOfWorkType, "cut-lines-polarization-survey")}
      >
        <ActivityWrapper
          id="cut-lines-polarization-survey"
          title="Cut Lines and Induced Polarization Survey"
          data={props.noticeOfWork.cut_lines_polarization_survey}
          isViewMode={props.isViewMode}
        >
          <FormSection name="cut_lines_polarization_survey">
            <CutLines
              isViewMode={props.isViewMode}
              renderOriginalValues={props.renderOriginalValues}
              isPreLaunch={props.isPreLaunch}
            />
          </FormSection>
        </ActivityWrapper>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="settling-pond"
        title="Settling Ponds"
      >
        <ActivityWrapper
          id="settling-pond"
          title="Settling Ponds"
          data={props.noticeOfWork.settling_pond}
          isViewMode={props.isViewMode}
        >
          <FormSection name="settling_pond">
            <SettlingPonds
              isViewMode={props.isViewMode}
              renderOriginalValues={props.renderOriginalValues}
              isPreLaunch={props.isPreLaunch}
            />
          </FormSection>
        </ActivityWrapper>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="sand-and-gravel"
        title="Sand and Gravel / Quarry Operations"
        showContent={renderActivities(props.noticeOfWorkType, "sand-and-gravel")}
      >
        <ActivityWrapper
          id="sand-and-gravel"
          title="Sand and Gravel / Quarry Operations"
          data={props.noticeOfWork.sand_gravel_quarry_operation}
          isViewMode={props.isViewMode}
        >
          <FormSection name="sand_gravel_quarry_operation">
            <SandGravelQuarry
              isViewMode={props.isViewMode}
              renderOriginalValues={props.renderOriginalValues}
              isPreLaunch={props.isPreLaunch}
            />
          </FormSection>
        </ActivityWrapper>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="equipment"
        title="Equipment"
      >
        <ActivityWrapper
          id="equipment"
          title="Equipment"
          data={props.noticeOfWork.equipment}
          isViewMode={props.isViewMode}
        >
          <Equipment isViewMode={props.isViewMode} />
        </ActivityWrapper>
      </ScrollContentWrapper>
    </div>
  );
};

ReviewActivities.propTypes = propTypes;

export default ReviewActivities;

import React from "react";
import { PropTypes } from "prop-types";
import { bindActionCreators } from "redux";
import { FormSection, arrayInsert, arrayRemove, arrayPush } from "redux-form";
import { connect } from "react-redux";
import * as FORM from "@/constants/forms";
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

/**
 * @constant ReviewActivities renders edit/view for the NoW Application review step
 */

const propTypes = {
  noticeOfWorkType: PropTypes.string.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  arrayInsert: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
  arrayPush: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

export const ReviewActivities = (props) => {
  const editRecord = (newActivity, activity, rowIndex, isDelete, removeOnly) => {
    props.arrayRemove(FORM.EDIT_NOTICE_OF_WORK, activity, rowIndex);
    if (isDelete) {
      if (!removeOnly) {
        props.arrayPush(FORM.EDIT_NOTICE_OF_WORK, activity, {
          ...newActivity,
          state_modified: "delete",
        });
      }
    } else {
      props.arrayInsert(FORM.EDIT_NOTICE_OF_WORK, activity, rowIndex, newActivity);
    }
  };

  const addRecord = (activity, newActivity) => {
    props.arrayPush(FORM.EDIT_NOTICE_OF_WORK, activity, newActivity);
  };

  return (
    <div>
      <ScrollContentWrapper
        id="exploration-access"
        title="Access Roads, Trails, Helipads, Air Strips, Boat Ramps"
        data={props.noticeOfWork.exploration_access}
        isViewMode={props.isViewMode}
      >
        <FormSection name="exploration_access">
          <AccessRoads
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="blasting-operation"
        title="Blasting"
        data={props.noticeOfWork.blasting_operation}
        isViewMode={props.isViewMode}
      >
        <FormSection name="blasting_operation">
          <Blasting isViewMode={props.isViewMode} />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="camps"
        title="Camps, Buildings, Staging Areas, Fuel/Lubricant Storage"
        data={props.noticeOfWork.camps}
        isViewMode={props.isViewMode}
      >
        <FormSection name="camps">
          <Camps isViewMode={props.isViewMode} editRecord={editRecord} addRecord={addRecord} />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="cut-lines-polarization-survey"
        title="Cut Lines and Induced Polarization Survey"
        data={props.noticeOfWork.cut_lines_polarization_survey}
        showContent={renderActivities(props.noticeOfWorkType, "cut-lines-polarization-survey")}
        isViewMode={props.isViewMode}
      >
        <FormSection name="cut_lines_polarization_survey">
          <CutLines isViewMode={props.isViewMode} editRecord={editRecord} addRecord={addRecord} />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="exploration-surface-drilling"
        title="Exploration Surface Drilling"
        data={props.noticeOfWork.exploration_surface_drilling}
        isViewMode={props.isViewMode}
      >
        <FormSection name="exploration_surface_drilling">
          <SurfaceDrilling
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="mechanical-trenching"
        title="Mechanical Trenching / Test Pits"
        data={props.noticeOfWork.mechanical_trenching}
        isViewMode={props.isViewMode}
      >
        <FormSection name="mechanical_trenching">
          <MechanicalTrenching
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="settling-pond"
        title="Settling Ponds"
        data={props.noticeOfWork.settling_pond}
        isViewMode={props.isViewMode}
      >
        <FormSection name="settling_pond">
          <SettlingPonds
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="surface-bulk-sample"
        title="Surface Bulk Sample"
        data={props.noticeOfWork.surface_bulk_sample}
        showContent={renderActivities(props.noticeOfWorkType, "surface-bulk-sample")}
        isViewMode={props.isViewMode}
      >
        <FormSection name="surface_bulk_sample">
          <SurfaceBulkSamples
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="underground-exploration"
        title="Underground Exploration"
        data={props.noticeOfWork.underground_exploration}
        showContent={renderActivities(props.noticeOfWorkType, "underground-exploration")}
        isViewMode={props.isViewMode}
      >
        <FormSection name="underground_exploration">
          <UndergroundExploration
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="sand-and-gravel"
        title="Sand and Gravel / Quarry Operations"
        data={props.noticeOfWork.sand_and_gravel}
        showContent={renderActivities(props.noticeOfWorkType, "sand-and-gravel")}
        isViewMode={props.isViewMode}
      >
        <FormSection name="sand_and_gravel">
          <SandGravelQuarry
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="placer-operation"
        title="Placer Operations"
        data={props.noticeOfWork.placer_operation}
        showContent={renderActivities(props.noticeOfWorkType, "placer-operation")}
        isViewMode={props.isViewMode}
      >
        <FormSection name="placer_operation">
          <Placer isViewMode={props.isViewMode} editRecord={editRecord} addRecord={addRecord} />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="water-supply"
        title="Water Supply"
        data={props.noticeOfWork.water_supply}
        isViewMode={props.isViewMode}
      >
        <FormSection name="water_supply">
          <WaterSupply
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
    </div>
  );
};

ReviewActivities.propTypes = propTypes;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      arrayInsert,
      arrayRemove,
      arrayPush,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(ReviewActivities);

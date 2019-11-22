import React from "react";
import { PropTypes } from "prop-types";
import { FormSection } from "redux-form";
import CustomPropTypes from "@/customPropTypes";
import ScrollContentWrapper from "@/components/common/wrappers/ScrollContentWrapper";
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

/**
 * @constant ReviewActivities renders edit/view for the NoW Application review step
 */

const propTypes = {
  // isViewMode is being passed into field Component, thus ReviewActivities.js assumes it isn't being used
  // eslint-disable-next-line
  isViewMode: PropTypes.bool.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

export const ReviewActivities = (props) => {
  return (
    <div>
      <ScrollContentWrapper
        id="access-roads"
        title="Access Roads, Trails, Helipads, Air Strips, Boat Ramps"
      >
        <FormSection name="exploration_access">
          <AccessRoads
            initialValues={props.noticeOfWork.exploration_access}
            isViewMode={props.isViewMode}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="blasting" title="Blasting">
        <FormSection name="blasting_operation">
          <Blasting
            initialValues={props.noticeOfWork.blasting_operation}
            isViewMode={props.isViewMode}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="camps"
        title="Camps, Buildings, Staging Areas, Fuel/Lubricant Storage"
      >
        <FormSection name="camps">
          <Camps initialValues={props.noticeOfWork.camps} isViewMode={props.isViewMode} />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="cut-lines-polarization-survey"
        title="Cut Lines and Induced Polarization Survey"
      >
        <FormSection name="cut_lines_polarization_survey">
          <CutLines
            initialValues={props.noticeOfWork.cut_lines_polarization_survey}
            isViewMode={props.isViewMode}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="surface-drilling" title="Exploration Surface Drilling">
        <FormSection name="exploration_surface_drilling">
          <SurfaceDrilling
            initialValues={props.noticeOfWork.exploration_surface_drilling}
            isViewMode={props.isViewMode}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="mechanical-trenching" title="Mechanical Trenching / Test Pits">
        <FormSection name="mechanical_trenching">
          <MechanicalTrenching
            initialValues={props.noticeOfWork.mechanical_trenching}
            isViewMode={props.isViewMode}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="settling-ponds" title="Settling Ponds">
        <FormSection name="settling_pond">
          <SettlingPonds
            initialValues={props.noticeOfWork.settling_pond}
            isViewMode={props.isViewMode}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="surface-bulk-samples" title="Surface Bulk Sample">
        <FormSection name="surface_bulk_sample">
          <SurfaceBulkSamples
            initialValues={props.noticeOfWork.surface_bulk_sample}
            isViewMode={props.isViewMode}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="underground-exploration" title="Underground Exploration">
        <FormSection name="underground_exploration">
          <UndergroundExploration
            initialValues={props.noticeOfWork.underground_exploration}
            isViewMode={props.isViewMode}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="sand-gravel-quarry-operations"
        title="Sand and Gravel / Quary Operations"
      >
        <FormSection name="sand_and_gravel">
          <SandGravelQuarry
            initialValues={props.noticeOfWork.sand_and_gravel}
            isViewMode={props.isViewMode}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="placer-operations" title="Placer Operations">
        <FormSection name="placer_operation">
          <Placer
            initialValues={props.noticeOfWork.placer_operation}
            isViewMode={props.isViewMode}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="water-supply" title="Water Supply">
        <FormSection name="water_supply">
          <WaterSupply
            initialValues={props.noticeOfWork.water_supply}
            isViewMode={props.isViewMode}
          />
        </FormSection>
      </ScrollContentWrapper>
    </div>
  );
};

ReviewActivities.propTypes = propTypes;

export default ReviewActivities;

import React from "react";
import { PropTypes } from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import ScrollContentWrapper from "@/components/common/wrappers/ScrollContentWrapper";
import AccessRoads from "@/components/noticeOfWork/applications/review/activities/AccessRoads";
import Blasting from "@/components/noticeOfWork/applications/review/activities/Blasting";
import SurfaceDrilling from "@/components/noticeOfWork/applications/review/activities/SurfaceDrilling";
import Camps from "@/components/noticeOfWork/applications/review/activities/Camps";
import CutLines from "@/components/noticeOfWork/applications/review/activities/CutLines";
import MechanicalTrenching from "@/components/noticeOfWork/applications/review/activities/MechanicalTrenching";
import SettlingPonds from "@/components/noticeOfWork/applications/review/activities/SettlingPonds";
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
        <AccessRoads
          initialValues={props.noticeOfWork.exploration_access}
          isViewMode={props.isViewMode}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="blasting" title="Blasting">
        <Blasting initialValues={props.noticeOfWork.blasting} isViewMode={props.isViewMode} />
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="camps"
        title="Camps, Buildings, Staging Areas, Fuel/Lubricant Storage"
      >
        <Camps initialValues={props.noticeOfWork.camps} isViewMode={props.isViewMode} />
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="cut-lines-polarization-survey"
        title="Cut Lines and Induced Polarization Survey"
      >
        <CutLines
          initialValues={props.noticeOfWork.cut_lines_polarization_survey}
          isViewMode={props.isViewMode}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="surface-drilling" title="Exploration Surface Drilling">
        <SurfaceDrilling
          initialValues={props.noticeOfWork.exploration_surface_drilling}
          isViewMode={props.isViewMode}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="mechanical-trenching" title="Mechanical Trenching / Test Pits">
        <MechanicalTrenching
          initialValues={props.noticeOfWork.mechanical_trenching}
          isViewMode={props.isViewMode}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="settling-ponds" title="Settling Ponds">
        <SettlingPonds
          initialValues={props.noticeOfWork.settling_pond}
          isViewMode={props.isViewMode}
        />
      </ScrollContentWrapper>

      <ScrollContentWrapper id="surface-bulk-samples" title="Surface Bulk Sample">
        <div />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="underground-exploration" title="Underground Exploration">
        <div />
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="sand-gravel-quarry-operations"
        title="Sand and Gravel / Quary Operations"
      >
        <div />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="placer-operations" title="Placer Operations">
        <div />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="water-supply" title="Water Supply">
        <div />
      </ScrollContentWrapper>
    </div>
  );
};

ReviewActivities.propTypes = propTypes;

export default ReviewActivities;

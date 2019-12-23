import React from "react";
import { PropTypes } from "prop-types";
import { bindActionCreators } from "redux";
import { FormSection, arrayInsert, arrayRemove, arrayPush } from "redux-form";
import { connect } from "react-redux";
import * as FORM from "@/constants/forms";
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
  arrayInsert: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
  arrayPush: PropTypes.func.isRequired,
  // noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
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
        id="access-roads"
        title="Access Roads, Trails, Helipads, Air Strips, Boat Ramps"
      >
        <FormSection name="exploration_access">
          <AccessRoads
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="blasting" title="Blasting">
        <FormSection name="blasting_operation">
          <Blasting isViewMode={props.isViewMode} />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="camps"
        title="Camps, Buildings, Staging Areas, Fuel/Lubricant Storage"
      >
        <FormSection name="camps">
          <Camps isViewMode={props.isViewMode} editRecord={editRecord} addRecord={addRecord} />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="cut-lines-polarization-survey"
        title="Cut Lines and Induced Polarization Survey"
      >
        <FormSection name="cut_lines_polarization_survey">
          <CutLines isViewMode={props.isViewMode} editRecord={editRecord} addRecord={addRecord} />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="surface-drilling" title="Exploration Surface Drilling">
        <FormSection name="exploration_surface_drilling">
          <SurfaceDrilling
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="mechanical-trenching" title="Mechanical Trenching / Test Pits">
        <FormSection name="mechanical_trenching">
          <MechanicalTrenching
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="settling-ponds" title="Settling Ponds">
        <FormSection name="settling_pond">
          <SettlingPonds
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="surface-bulk-samples" title="Surface Bulk Sample">
        <FormSection name="surface_bulk_sample">
          <SurfaceBulkSamples
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="underground-exploration" title="Underground Exploration">
        <FormSection name="underground_exploration">
          <UndergroundExploration
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="sand-gravel-quarry-operations"
        title="Sand and Gravel / Quary Operations"
      >
        <FormSection name="sand_and_gravel">
          <SandGravelQuarry
            isViewMode={props.isViewMode}
            editRecord={editRecord}
            addRecord={addRecord}
          />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="placer-operations" title="Placer Operations">
        <FormSection name="placer_operation">
          <Placer isViewMode={props.isViewMode} editRecord={editRecord} addRecord={addRecord} />
        </FormSection>
      </ScrollContentWrapper>
      <ScrollContentWrapper id="water-supply" title="Water Supply">
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

export default connect(
  null,
  mapDispatchToProps
)(ReviewActivities);

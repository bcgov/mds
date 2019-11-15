import { isEmpty } from "lodash";
import { createSelector } from "reselect";
import * as noticeOfWorkReducer from "@/reducers/noticeOfWorkReducer";

export const {
  getNoticeOfWorkList,
  getNoticeOfWorkPageData,
  getNoticeOfWork,
  getOriginalNoticeOfWork,
} = noticeOfWorkReducer;

export const getNOWReclamationSummary = createSelector(
  [getNoticeOfWork],
  (noticeOfWork) => {
    // will remove this const and use staticContentSelector once created
    const options = [
      {
        value: "cut_lines_polarization_survey",
        label: "Cut Lines and Induced Polarization Survey",
      },
      {
        value: "exploration_access",
        label: "Access Roads, Trails, Heli Pads, Air Strips, Boat Ramps",
      },
      {
        value: "placer_operation",
        label: "Placer Operations",
      },
      {
        value: "sand_and_gravel",
        label: "Sand and Gravel / Quarry Operations",
      },
      {
        value: "surface_bulk_sample",
        label: "Surface Bulk Sample",
      },
      {
        value: "underground_exploration",
        label: "Underground Exploration",
      },
      {
        value: "cut_lines_polarization_survey",
        label: "Camps, Buildings, Staging Area, Fuel/Lubricant Storage",
      },
      {
        value: "exploration_surface_drilling",
        label: "Exploration Surface Drilling",
      },
      {
        value: "mechanical_trenching",
        label: "Mechanical Trenching / Test Pits",
      },
      {
        value: "settling_pond",
        label: "Settling Ponds",
      },
    ];

    const reclamationList = [];
    options.forEach(({ value, label }) => {
      if (!isEmpty(noticeOfWork[value])) {
        reclamationList.push({
          label,
          total: noticeOfWork[value].total_disturbed_area
            ? noticeOfWork[value].total_disturbed_area
            : "0.00",
          cost: noticeOfWork[value].reclamation_cost
            ? noticeOfWork[value].reclamation_cost
            : "0.00",
        });
      }
    });
    return reclamationList;
  }
);

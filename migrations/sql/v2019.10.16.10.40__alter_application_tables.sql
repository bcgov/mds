ALTER TABLE permit_application RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE cut_lines_polarization_survey RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE equipment_assignment RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE water_supply RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE application_settling_pond_xref RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE exploration_surface_drilling RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE sand_gravel_quarry_operation RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE exploration_access RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE underground_exploration RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE camp RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE state_of_land RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE mechanical_trenching RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE surface_bulk_sample RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE application_placer_xref RENAME COLUMN permit_application_id TO now_application_id;
ALTER TABLE blasting_operation RENAME COLUMN permit_application_id TO now_application_id;

ALTER TABLE permit_application RENAME CONSTRAINT "permit_application_application_status_code_fkey" TO "now_application_now_application_status_code_fkey";
ALTER TABLE permit_application RENAME CONSTRAINT "permit_application_mine_guid_fkey" TO "now_application_mine_guid_fkey";
ALTER TABLE permit_application RENAME CONSTRAINT "permit_application_notice_of_work_type_code_fkey" TO "now_application_notice_of_work_type_code_fkey";
ALTER TABLE cut_lines_polarization_survey RENAME CONSTRAINT "cut_lines_polarization_survey_permit_application_id_fkey" TO "cut_lines_polarization_survey_now_application_id_fkey";
ALTER TABLE equipment_assignment RENAME CONSTRAINT "equipment_assignment_permit_application_id_fkey" TO "equipment_assignment_now_application_id_fkey";
ALTER TABLE water_supply RENAME CONSTRAINT "water_supply_permit_application_id_fkey" TO "water_supply_now_application_id_fkey";
ALTER TABLE application_settling_pond_xref RENAME CONSTRAINT "application_settling_pond_xref_permit_application_id_fkey" TO "now_application_settling_pond_xref_now_application_id_fkey";
ALTER TABLE exploration_surface_drilling RENAME CONSTRAINT "exploration_surface_drilling_permit_application_id_fkey" TO "exploration_surface_drilling_now_application_id_fkey";
ALTER TABLE sand_gravel_quarry_operation RENAME CONSTRAINT "sand_gravel_quarry_operation_permit_application_id_fkey" TO "sand_gravel_quarry_operation_now_application_id_fkey";
ALTER TABLE exploration_access RENAME CONSTRAINT "exploration_access_permit_application_id_fkey" TO "exploration_access_now_application_id_fkey";
ALTER TABLE underground_exploration RENAME CONSTRAINT "underground_exploration_permit_application_id_fkey" TO "underground_exploration_now_application_id_fkey";
ALTER TABLE camp RENAME CONSTRAINT "camp_permit_application_id_fkey" TO "camp_now_application_id_fkey";
ALTER TABLE state_of_land RENAME CONSTRAINT "state_of_land_permit_application_id_fkey" TO "state_of_land_now_application_id_fkey";
ALTER TABLE mechanical_trenching RENAME CONSTRAINT "mechanical_trenching_permit_application_id_fkey" TO "mechanical_trenching_now_application_id_fkey";
ALTER TABLE surface_bulk_sample RENAME CONSTRAINT "surface_bulk_sample_permit_application_id_fkey" TO "surface_bulk_sample_now_application_id_fkey";
ALTER TABLE application_placer_xref RENAME CONSTRAINT "application_placer_xref_permit_application_id_fkey" TO "now_application_placer_xref_now_application_id_fkey";
ALTER TABLE blasting_operation RENAME CONSTRAINT "blasting_operation_permit_application_id_fkey" TO "blasting_operation_now_application_id_fkey";

ALTER TABLE permit_application RENAME TO now_application;
ALTER TABLE application_status RENAME TO now_application_status;
ALTER TABLE application_placer_xref RENAME TO now_application_placer_xref;
ALTER TABLE application_document_xref RENAME TO now_application_document_xref;
ALTER TABLE application_document_type RENAME TO now_application_document_type;
ALTER TABLE application_settling_pond_xref RENAME TO now_application_settling_pond_xref;
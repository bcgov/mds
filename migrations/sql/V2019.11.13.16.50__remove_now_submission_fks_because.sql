  alter table now_submissions.application_nda drop constraint                     application_nda_applicantclientid_fkey;
  alter table now_submissions.application_nda drop constraint                     application_nda_submitterclientid_fkey;
  alter table now_submissions.application drop constraint                         application_applicantclientid_fkey;
  alter table now_submissions.application drop constraint                         application_submitterclientid_fkey;
  alter table now_submissions.contact drop constraint                             contact_messageid_fkey;
  alter table now_submissions.surface_bulk_sample_activity drop constraint        surface_bulk_sample_activity_messageid_fkey;
  alter table now_submissions.document drop constraint                            document_messageid_fkey;
  alter table now_submissions.document_nda drop constraint                        document_nda_messageid_fkey;
  alter table now_submissions.document_start_stop drop constraint                 document_start_stop_messageid_fkey;
  alter table now_submissions.sand_grv_qry_activity drop constraint               sand_grv_qry_activity_messageid_fkey;
  alter table now_submissions.under_exp_new_activity drop constraint              under_exp_new_activity_messageid_fkey;
  alter table now_submissions.under_exp_rehab_activity drop constraint            under_exp_rehab_activity_messageid_fkey;
  alter table now_submissions.under_exp_surface_activity drop constraint          under_exp_surface_activity_messageid_fkey;
  alter table now_submissions.water_source_activity drop constraint               water_source_activity_messageid_fkey;
  alter table now_submissions.existing_placer_activity_xref drop constraint       existing_placer_activity_xref_messageid_fkey;
  alter table now_submissions.existing_placer_activity_xref drop constraint       existing_placer_activity_xref_placeractivityid_fkey;
  alter table now_submissions.existing_settling_pond_xref drop constraint         existing_settling_pond_xref_messageid_fkey;
  alter table now_submissions.existing_settling_pond_xref drop constraint         existing_settling_pond_xref_settlingpondid_fkey;
  alter table now_submissions.mech_trenching_equip_xref drop constraint           mech_trenching_equip_xref_messageid_fkey;
  alter table now_submissions.mech_trenching_equip_xref drop constraint           mech_trenching_equip_xref_equipmentid_fkey;
  alter table now_submissions.surface_bulk_sample_equip_xref drop constraint      surface_bulk_sample_equip_xref_messageid_fkey;
  alter table now_submissions.surface_bulk_sample_equip_xref drop constraint      surface_bulk_sample_equip_xref_equipmentid_fkey;
  alter table now_submissions.sand_grv_qry_equip_xref drop constraint             sand_grv_qry_equip_xref_messageid_fkey;
  alter table now_submissions.sand_grv_qry_equip_xref drop constraint             sand_grv_qry_equip_xref_equipmentid_fkey;
  alter table now_submissions.placer_equip_xref drop constraint                   placer_equip_xref_messageid_fkey;
  alter table now_submissions.placer_equip_xref drop constraint                   placer_equip_xref_equipmentid_fkey;
  alter table now_submissions.proposed_placer_activity_xref drop constraint       proposed_placer_activity_xref_messageid_fkey;
  alter table now_submissions.proposed_placer_activity_xref drop constraint       proposed_placer_activity_xref_placeractivityid_fkey;
  alter table now_submissions.proposed_settling_pond_xref drop constraint         proposed_settling_pond_xref_messageid_fkey;
  alter table now_submissions.proposed_settling_pond_xref drop constraint         proposed_settling_pond_xref_settlingpondid_fkey;
  alter table now_submissions.exp_access_activity drop constraint                 exp_access_activity_messageid_fkey;
  alter table now_submissions.exp_surface_drill_activity drop constraint          exp_surface_drill_activity_messageid_fkey;
  alter table now_submissions.mech_trenching_activity drop constraint             mech_trenching_activity_messageid_fkey;
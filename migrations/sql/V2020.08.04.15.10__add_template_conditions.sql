DROP SEQUENCE standard_permit_conditions_standard_permit_condition_id_seq cascade;

INSERT INTO standard_permit_conditions
(standard_permit_condition_id, notice_of_work_type, condition, condition_category_code, condition_type_code, display_order, create_user, update_user)
VALUES
-- General
	(1, 'SAG', 'Compliance with Mines Act and Code', 'GEC', 'SEC', 1, 'system-mds', 'system-mds'),
	(2, 'SAG', 'Changes to Permitted Activities and Amendment of the Permit', 'GEC', 'SEC', 2, 'system-mds', 'system-mds'),
	(3, 'SAG', 'Permit Approval', 'GEC', 'SEC', 3, 'system-mds', 'system-mds'),
  (4, 'SAG', 'Permit', 'GEC', 'SEC', 4, 'system-mds', 'system-mds'),
	(5, 'SAG', 'Mine Closure', 'GEC', 'SEC', 5, 'system-mds', 'system-mds'),
	(6, 'SAG', 'Documentation', 'GEC', 'SEC', 6, 'system-mds', 'system-mds'),

-- Health and Safety
  (7, 'SAG', 'Mine Emergency Response Plan', 'HSC', 'SEC', 1, 'system-mds', 'system-mds'),
	(8, 'SAG', 'Fuels and Lubricant Handling, Transportation and Storage', 'HSC', 'SEC', 2, 'system-mds', 'system-mds'),

  -- Geotechnical
  (9, 'SAG', 'Site Stability', 'GOC', 'SEC', 1, 'system-mds', 'system-mds'),

   -- Environmental Land and Watercourses Conditions
  (10, 'SAG', 'Cultural Heritage and Resources Protection', 'ELC', 'SEC', 1, 'system-mds', 'system-mds'),
  (11, 'SAG', 'Management of Invasive Species', 'ELC', 'SEC', 2, 'system-mds', 'system-mds'),

  -- Reclamation and Closure Program Conditions
	(12, 'SAG', 'Security', 'RCC', 'SEC', 1, 'system-mds', 'system-mds'),
	(13, 'SAG', 'Obligation to Reclaim', 'RCC', 'SEC', 2, 'system-mds', 'system-mds'),
	(14, 'SAG', 'Watercourses and Aquatic Ecosystem Protection', 'RCC', 'SEC', 3, 'system-mds', 'system-mds'),
  (15, 'SAG', 'Roads', 'RCC', 'SEC', 4, 'system-mds', 'system-mds')
on conflict do nothing;



INSERT INTO standard_permit_conditions
(standard_permit_condition_id, notice_of_work_type, parent_standard_permit_condition_id, condition, condition_category_code, condition_type_code, display_order, create_user, update_user)
VALUES
-- -- General 
-- condition === 'Compliance with Mines Act and Code'
	(16, 'SAG', 1, 'The Permittee shall ensure that all work is in compliance with all sections and parts of the Mines Act and the Health, Safety and Reclamation Code for Mines in B.C. (Code), and the Permittee shall obey all orders issued by the Chief Inspector or the Chief Inspector’s delegate.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  -- condition === 'Changes to Permitted Activities and Amendment of the Permit'
  (17, 'SAG', 2, 'The owner, agent or manager (herein called the Permittee) shall notify the Chief Inspector in writing of any intention to depart from the approved Application and this Mines Act permit <<permit_no>> to any substantial degree, and shall not proceed to implement the proposed changes without the written authorization of the Chief Inspector or their delegate', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (18, 'SAG', 2, 'The Chief Inspector reserves the right to amend the conditions set forth in Mines Act permit <<permit_no>>', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),
  -- condition === 'Permit Approval'
  (19, 'SAG', 3, 'Write out activities and total disturbance as indicated in the Notice of Work application (that you approve of – you must specify activities that were applied for that you do not approve of if there are any)', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (20, 'SAG', 3, 'A Maximum Annual Produced Tonnage of <<annual_tonnes>>', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),
  (21, 'SAG', 3, 'This permit approval is valid until <<expiry_dt>>', 'GEC', 'CON', 3, 'system-mds', 'system-mds'),
    -- condition === 'Permit'
  (22, 'SAG', 4, 'This Permit is not transferable or assignable.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
   -- condition === 'Mine Closure'
  (23, 'SAG', 5, 'If the Operations cease for a period longer than one (1) year the Permittee shall either continue to carry out the conditions of the permit or apply for an amendment setting out a revised program for approval by the Chief Inspector.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
   -- condition === 'Documentation'
  (24, 'SAG', 6, 'While they remain valid and subsisting, both this Permit and appropriate and up-to-date documentation (including maps of the subject mining property) must be kept at the subject mining property, and must be available to authorized Inspectors and other authorized government officials upon request;', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (25, 'SAG', 6, 'Annual reports shall be submitted in a form and containing the information specified by the Chief Inspector as required', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),
  (26, 'SAG', 6, 'The permittee shall submit an updated Mine Plan and Notice of Work prior to the expiry of approval <<approval_no>> on <<expiry_dt>>.', 'GEC', 'CON', 3, 'system-mds', 'system-mds'),

  -- Health and Safety
  -- condition === 'Mine Emergency Response Plan'
	(27, 'SAG', 7, 'The Mine Emergency Response Plan (‘MERP’) dated <<document_merp_date>> must be implemented prior to commencement. In addition to addressing daily operational issues, the plan shall specifically address emergency evacuation of personnel due to injury and forest fire hazard. All persons employed or visiting on the mine site shall be trained with the MERP. The plan shall be available on site for review upon request and must be updated as changes arise.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),
  -- condition === 'Fuels and Lubricant Handling, Transportation and Storage'
  (28, 'SAG', 8, 'Fuels and Lubricants, if stored on the mine site, shall conform to the requirements of the document:  A Field Guide to Fuel Handling, Transportation and Storage, 3rd Edition, February 2002. Ministry of Water, Land and Air Protection and the Forest Service British Columbia.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),
  (29, 'SAG', 8, 'The Permittee shall develop and implement a hydrocarbon management plan upon commencement of work that deals with fueling, operational servicing, spill prevention and clean-up for fuels and lubricants stored on the mine site. The plan shall be made available to the Chief Inspector upon request and shall account for the following at minimum:', 'HSC', 'CON', 2, 'system-mds', 'system-mds'),
  -- list items for the above condition:
  (30, 'SAG', 29, 'Fuel and lubricants shall be delivered to site as needed to re-supply fuel and oil tanks on mobile and fixed equipment;', 'HSC', 'LIS', 1, 'system-mds', 'system-mds'),
  (31, 'SAG', 29, 'Impermeable, oil absorbent matting shall be used when refueling and servicing equipment;', 'HSC', 'LIS', 2, 'system-mds', 'system-mds'),
  (32, 'SAG', 29, 'While refueling the operator shall be in control of the refueling nozzle at all times;', 'HSC', 'LIS', 3, 'system-mds', 'system-mds'),
  (33, 'SAG', 29, 'If any petroleum, hydrocarbon or other product (no matter how small) is spilled the contaminated soil/gravels shall be forthwith collected and removed for appropriate disposal;', 'HSC', 'LIS', 4, 'system-mds', 'system-mds'),
  (34, 'SAG', 29, 'Fuel or oil leaks on equipment shall be effectively repaired as soon as they are discovered, or the equipment shall be removed from the site and not operated until repairs have been made;', 'HSC', 'LIS', 5, 'system-mds', 'system-mds'),
  (35, 'SAG', 29, 'An emergency spill containment and clean up kit shall be maintained at the site while it is in operation. The kit shall have the capacity to contain and clean up 100% of a spill from a failure of the largest volume of a fuel or lubricant tank or system plus 10%. Secondary containment must be utilized on all stationary equipment with fuel storage capacity (e.g., Pumps).', 'HSC', 'LIS', 6, 'system-mds', 'system-mds'),

-- Geotechnical
-- condition === 'Site Stability'
  (36, 'SAG', 9, 'The Chief Inspector shall be advised in writing at the earliest opportunity of any unforeseen conditions that could adversely affect the extraction of materials, site stability, erosion control or the reclamation of the site;', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),
  (37, 'SAG', 9, 'The stability of the slopes shall be maintained at all times and erosion shall be controlled at all times (as described in <<document>> – updated as required if there is a sediment and erosion control plan – or remove reference to document);', 'GOC', 'CON', 2, 'system-mds', 'system-mds'),
  (38, 'SAG', 9, 'The discovery of any significant subsurface flows of water, seeps, substantial amounts of fine textured, soils, silts and clays, as well as significant adverse geological conditions shall be reported to the Chief Inspector as soon as possible and work shall cease until written approval from the Chief Inspector advises otherwise.', 'GOC', 'CON', 3, 'system-mds', 'system-mds'),

 -- Environmental Land and Watercourses Conditions
 -- condition === 'Cultural Heritage and Resources Protection'
  (39, 'SAG', 10, 'The Archaeological Chance Find Procedure (‘CFP’) <<document_CFP>>, must be implemented prior to commencement of work.  All persons employed or visiting on the mine site shall be trained with the CFP.  The plan shall be available on site for review upon request and must be updated as changes arise.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
   -- condition === 'Management of Invasive Species'
  (40, 'SAG', 11, 'Prior to commencement of work, the Permittee must develop an Invasive Species Management Plan and submit the plan to MMD-Cranbrook@gov.bc.ca', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (41, 'SAG', 11, 'The Invasive Species Management Plan must be implemented on commencement of work for the duration of the authorization;', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (42, 'SAG', 11, 'Occurrences of invasive species must be reported through the Provincial online reporting system.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),


-- Reclamation and Closure Program Conditions
-- condition === 'Security'
  (43, 'SAG', 12, 'The Permittee shall maintain with the Minister of Finance security in the amount of <<X dollars>> ($<<bond_amt>>).  The security will be held by the Minister of Finance and for the proper performance of the approved program and all the conditions of this permit in a manner satisfactory to the Chief Inspector.', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  -- condition === 'Obligation to Reclaim'
  (44, 'SAG', 13, 'The surface of the land and watercourses shall be reclaimed to the following end land use:  <<land_use>>;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (45, 'SAG', 13, 'Excluding lands that are not to be reclaimed, the average land capability to be achieved on the remaining lands shall not be less than the average that existed prior to mining, unless the land capability is not consistent with the approved end land use;', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),
  (46, 'SAG', 13, 'Land shall be re-vegetated to a self-sustaining state using a certified native seed mix appropriate for the local BEC zone <<zone>>;', 'RCC', 'CON', 3, 'system-mds', 'system-mds'),
  (47, 'SAG', 13, 'On all lands to be revegetated, the growth medium shall satisfy land use, productivity, and water quality objectives.  Topsoil and overburden (to rooting depth) shall be removed from operational areas prior to any disturbance of the land and stockpiled separately on the property for use in reclamation programs, unless the Permittee can provide evidence which demonstrates, to the satisfaction of the Chief Inspector, that reclamation objectives can otherwise be achieved;', 'RCC', 'CON', 4, 'system-mds', 'system-mds'),
  (48, 'SAG', 13, 'The Permittee shall undertake monitoring programs, as required by the Chief Inspector, to demonstrate that reclamation objectives are being achieved.', 'RCC', 'CON', 5, 'system-mds', 'system-mds'),
  -- condition === 'Watercourses and Aquatic Ecosystem Protection'
  (49, 'SAG', 14, 'Water which flows from disturbed areas shall be collected and diverted into settling ponds, unless water is effectively ex-filtrating through gravels;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (50, 'SAG', 14, 'All water pumps used within fish-bearing streams are to be fitted with screens to prevent fish entrainment that meet the requirements of the Department of Fisheries and Oceans Freshwater Intake End-of-Pipe Fish Screen Guideline.', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),
  (51, 'SAG', 14, '<<Works in and about a stream conditions from template.>>', 'RCC', 'CON', 3, 'system-mds', 'system-mds'),
  -- condition === 'Roads'
  (52, 'SAG', 15, 'All roads shall be reclaimed in accordance with land use objectives unless permanent access is required to be maintained;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (53, 'SAG', 15, 'Individual roads will be exempted from the requirement for total reclamation under condition 4(a) if either:', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
-- list items for the above condition:
  (54, 'SAG', 53, 'The Permittee can demonstrate that an agency of the Crown has explicitly accepted responsibility for the operation, maintenance and ultimate deactivation and abandonment of the road; or', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),
  (55, 'SAG', 53, 'The Permittee can demonstrate that another private party has explicitly agreed to accept responsibility for the operation, maintenance and ultimate deactivation and abandonment of the road and has, in this regard, agreed to comply with all the terms and conditions, including bonding provisions, of this reclamation permit, and to comply with all other relevant provincial government (and federal government) regulatory requirements.', 'RCC', 'LIS', 2, 'system-mds', 'system-mds')                                                                                   
on conflict do nothing;

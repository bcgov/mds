UPDATE placer_operation SET proposed_production_unit_type_code = null;
UPDATE placer_operation SET reclamation_unit_type_code = 'HA' WHERE reclamation_area IS NOT NULL;
ALTER TABLE requirements
    ADD COLUMN version integer DEFAULT 1;

UPDATE requirements
    SET version = 1
    WHERE version IS NULL;

ALTER TABLE requirements
    ALTER COLUMN version SET NOT NULL;

CREATE INDEX idx_requirements_version ON requirements (version);

-- INSERT top level requirements

INSERT INTO requirements (description, display_order, version, create_user, update_user)
VALUES('INTRODUCTION AND PROJECT OVERVIEW', 1, 2, 'system-mds', 'system-mds');

INSERT INTO requirements (description, display_order, version, create_user, update_user)
VALUES('INDIGENOUS NATION ENGAGEMENT', 2, 2, 'system-mds', 'system-mds');

INSERT INTO requirements (description, display_order, version, create_user, update_user)
VALUES('BASELINE INFORMATION', 3, 2, 'system-mds', 'system-mds');

INSERT INTO requirements (description, display_order, version, create_user, update_user)
VALUES('MINE PLAN', 4, 2, 'system-mds', 'system-mds');

INSERT INTO requirements (description, display_order, version, create_user, update_user)
VALUES('RECLAMATION AND CLOSURE PLAN', 5, 2, 'system-mds', 'system-mds');

INSERT INTO requirements (description, display_order, version, create_user, update_user)
VALUES('WATER QUALITY MITIGATION AND WATER MODELLING', 6, 2, 'system-mds', 'system-mds');

INSERT INTO requirements (description, display_order, version, create_user, update_user)
VALUES('EFFLUENT DISCHARGES TO THE ENVIRONMENT', 7, 2, 'system-mds', 'system-mds');

INSERT INTO requirements (description, display_order, version, create_user, update_user)
VALUES('ENVIRONMENTAL EFFECTS ASSESSMENT', 8, 2, 'system-mds', 'system-mds');

INSERT INTO requirements (description, display_order, version, create_user, update_user)
VALUES('ENVIRONMENTAL MONITORING', 9, 2, 'system-mds', 'system-mds');

INSERT INTO requirements (description, display_order, version, create_user, update_user)
VALUES('MANAGEMENT PLANS', 10, 2, 'system-mds', 'system-mds');

INSERT INTO requirements (description, display_order, version, create_user, update_user)
VALUES('RECLAMATION LIABILITY COST ESTIMATE', 11, 2, 'system-mds', 'system-mds');

-- INSERT nested 1. INTRODUCTION AND PROJECT OVERVIEW requirements
DO $$
    DECLARE
        parent_id_1 INTEGER;
        parent_id_2 INTEGER;

    BEGIN
        SELECT requirement_id INTO parent_id_1
        FROM requirements
            WHERE description = 'INTRODUCTION AND PROJECT OVERVIEW' AND version = 2;

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Project Description', 1, parent_id_1, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Proponent Information', 2, parent_id_1, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Project Overview', 3, parent_id_1, 'system-mds', 'system-mds', 2);

            -- INSERT child requirements for 1.3 - Project Overview
            SELECT requirement_id INTO parent_id_2
            FROM requirements
            WHERE description = 'Project Overview' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Project History ', 1, parent_id_2, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Overview of Products', 2, parent_id_2, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Location, Access, and Land Use', 3, parent_id_2, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Mine Components', 4, parent_id_2, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Mine Design and Assessment Team', 5, parent_id_2, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Spatial Data', 6, parent_id_2, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Concordance with Environmental Assessment Conditions', 7, parent_id_2, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Regulatory Framework', 4, parent_id_1, 'system-mds', 'system-mds', 2);

    END;

$$;

-- INSERT nested 2. INDIGENOUS NATION ENGAGEMENT requirements
DO $$
    DECLARE
        indigenous_nation_id INTEGER;

    BEGIN
        SELECT requirement_id INTO indigenous_nation_id
        FROM requirements
        WHERE description = 'INDIGENOUS NATION ENGAGEMENT' AND version = 2;

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Background', 1, indigenous_nation_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Engagement Efforts and Information', 2, indigenous_nation_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Aboriginal Interests and Potential Project Impacts', 3, indigenous_nation_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Engagement and Participation Throughout Mine Life', 4, indigenous_nation_id, 'system-mds', 'system-mds', 2);

    END;

$$;

-- INSERT nested 3. BASELINE INFORMATION requirements
DO $$
    DECLARE
        baseline_information_id INTEGER;
        geology_id INTEGER;
        water_quantity_id INTEGER;
        water_quality_id INTEGER;
        fisheries_id INTEGER;

    BEGIN
        SELECT requirement_id INTO baseline_information_id
        FROM requirements
        WHERE description = 'BASELINE INFORMATION' AND version = 2;

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Meteorology and Climate', 1, baseline_information_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Geology', 2, baseline_information_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO geology_id
            FROM requirements
            WHERE description = 'Geology' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Deposit Geology', 1, geology_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Surficial Geology, Terrain, and Geohazard Mapping', 2, geology_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Natural and Seismic Hazards Assessment', 3, geology_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Soil Survey and Soil Characterization for Reclamation', 4, geology_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Topography and Surface Drainage Features', 3, baseline_information_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Water Quantity', 4, baseline_information_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO water_quantity_id
            FROM requirements
            WHERE description = 'Water Quantity' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Surface Water Quantity', 1, water_quantity_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Groundwater Quantity', 2, water_quantity_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Water Quality', 5, baseline_information_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO water_quality_id
            FROM requirements
            WHERE description = 'Water Quality' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Surface Water Quality', 1, water_quantity_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Groundwater Quality', 2, water_quantity_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Sediment Quality', 6, baseline_information_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Fisheries and Aquatic Resources', 7, baseline_information_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO fisheries_id
            FROM requirements
            WHERE description = 'Fisheries and Aquatic Resources' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Periphyton and Benthic Invertebrate Community Measures', 1, fisheries_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Fish and Fish Habitat', 2, fisheries_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Tissue Residues', 3, fisheries_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Ecosystems and Wildlife', 8, baseline_information_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Potential Receptors of Mine-related Influences', 9, baseline_information_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Land Status and Use', 10, baseline_information_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Archaeology', 11, baseline_information_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Cultural Use', 12, baseline_information_id, 'system-mds', 'system-mds', 2);
    END;

$$;

-- INSERT nested 4. MINE PLAN requirements
DO $$
    DECLARE
        mine_plan_id INTEGER;
        mine_facility_id INTEGER;
        tailings_id INTEGER;
        dumps_id INTEGER;
        surface_management_id INTEGER;
        closure_id INTEGER;

    BEGIN
        SELECT requirement_id INTO mine_plan_id
        FROM requirements
        WHERE description = 'MINE PLAN' AND version = 2;

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Mine Plan Overview', 1, mine_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Existing and Permitted Mine Plan', 2, mine_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Proposed Mine Plan', 3, mine_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Mine Facility Engineering Designs', 4, mine_plan_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO mine_facility_id
            FROM requirements
            WHERE description = 'Mine Facility Engineering Designs' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Open Pits', 1, mine_facility_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Underground Workings', 2, mine_facility_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Tailings Storage Facilities, Dams, and Associated Infrastructure', 3, mine_facility_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO tailings_id
                FROM requirements
                WHERE description = 'Tailings Storage Facilities, Dams, and Associated Infrastructure' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Small Dams', 1, tailings_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Low Consequence Classification Dams', 2, tailings_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Significant or Higher Consequence Classification Dams', 3, tailings_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Tailings Storage Facilities', 4, tailings_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Dumps and Stockpiles', 4, mine_facility_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO dumps_id
                FROM requirements
                WHERE description = 'Dumps and Stockpiles' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Dumps (Stability Class II or less)', 1, dumps_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Dumps (Stability Class III or greater) and Major Dumps', 2, dumps_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Surface Water Management Structures', 5, mine_facility_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO surface_management_id
                FROM requirements
                WHERE description = 'Surface Water Management Structures' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Ponds or Impoundments (without Dams)', 1, surface_management_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Water Conveyance Structures', 2, surface_management_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Mine Roads', 6, mine_facility_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Processing Plant (Mill)', 7, mine_facility_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Buildings, ancillary Facilities, and Other Infrastructure', 8, mine_facility_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Closure Designs', 9, mine_facility_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO closure_id
                FROM requirements
                WHERE description = 'Closure Designs' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Open Pits', 1, closure_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Underground', 2, closure_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('TSFs and Dams', 3, closure_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Dumps and Stockpiles', 4, closure_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Surface Water Management Structures', 5, closure_id, 'system-mds', 'system-mds', 2);
    END;
$$;

-- INSERT nested 5. RECLAMATION AND CLOSURE PLAN requirements
DO $$
    DECLARE
        reclamation_plan_id INTEGER;
        end_land_use_id INTEGER;

        BEGIN
            SELECT requirement_id INTO reclamation_plan_id
            FROM requirements
            WHERE description = 'RECLAMATION AND CLOSURE PLAN' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('End Land Use and Capability Matrics for Planned Infrastructure/Disturbance Footprints', 1, reclamation_plan_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO end_land_use_id
                FROM requirements
                WHERE description = 'End Land Use and Capability Matrics for Planned Infrastructure/Disturbance Footprints' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Pre-mining End Land Use and Capability', 1, end_land_use_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Post-mining End Land Use and Cabability Objectives/Metrics', 2, end_land_use_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Existing Mine Disturbance Footprints and Conditions', 2, reclamation_plan_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Proposed 5-year Mine Disturbance Footprint', 3, reclamation_plan_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Life of Mine Disturbance Footprint', 4, reclamation_plan_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Reclamation and Closure Approaches and Prescriptions', 5, reclamation_plan_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Habitat Compensation', 6, reclamation_plan_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Trace Elements in Soils and Vegetation', 7, reclamation_plan_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Contaminated Sites and Ecological Risk Assessment', 8, reclamation_plan_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Disposal of Chemicals, Reagents, Hazardous Materials, and Contaminated Materials', 9, reclamation_plan_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Groundwater Well Decommissioning', 10, reclamation_plan_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Reclamation and Closure Research', 11, reclamation_plan_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Reclamation Monitoring', 12, reclamation_plan_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Post-closure Reclamation and Maintenance', 13, reclamation_plan_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Care and Maintence', 14, reclamation_plan_id, 'system-mds', 'system-mds', 2);
    END;
$$;

-- INSERT nested 6. WATER QUALITY MITIGATION AND WATER MODELLING requirements
DO $$
    DECLARE
        water_quality_id INTEGER;
        water_mitigation_id INTEGER;
        source_control_id INTEGER;
        tech_selection_id INTEGER;
        water_effluent_treatment_id INTEGER;
        hydrogeo_modeling_id INTEGER;

    BEGIN
        SELECT requirement_id INTO water_quality_id
        FROM requirements
        WHERE description = 'WATER QUALITY MITIGATION AND WATER MODELLING' AND version = 2;

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Metal Leaching and Acid Rock Drainage Characterization', 1, water_quality_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Geochemical Source Terms', 2, water_quality_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Conceptual Site Model', 3, water_quality_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Water Quality Mitigation Measures', 4, water_quality_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO water_mitigation_id
            FROM requirements
            WHERE description = 'Water Quality Mitigation Measures' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Source Control', 1, water_mitigation_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO source_control_id
                FROM requirements
                WHERE description = 'Source Control' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Management Practices', 1, source_control_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Engineered Controls', 2, source_control_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Water Management Measures', 2, water_mitigation_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Technology Selection', 3, water_mitigation_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO tech_selection_id
                FROM requirements
                WHERE description = 'Technology Selection' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Best Achievable Technology Evaluation', 1, tech_selection_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Technology Readiness Assessment', 2, tech_selection_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Water and Effluent Treatment', 4, water_mitigation_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO water_effluent_treatment_id
                FROM requirements
                WHERE description = 'Water and Effluent Treatment' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Description', 1, water_effluent_treatment_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Location', 2, water_effluent_treatment_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Detailed Design', 3, water_effluent_treatment_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Treatment Effectiveness', 4, water_effluent_treatment_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Performance Risks', 5, water_effluent_treatment_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Influent and Effluent Water Quality', 6, water_effluent_treatment_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Waste Byproducts', 7, water_effluent_treatment_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Maintenance', 8, water_effluent_treatment_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Emergency Response Procedures', 9, water_effluent_treatment_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Contingency Plans', 10, water_effluent_treatment_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Monitoring Plans', 11, water_effluent_treatment_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Schedule', 12, water_effluent_treatment_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Water Treatment Research and Development Program', 5, water_mitigation_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Hydrogeologic Modelling', 5, water_quality_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO hydrogeo_modeling_id
            FROM requirements
            WHERE description = 'Hydrogeologic Modelling' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Conceptual Hydrogeologic Mode', 1, hydrogeo_modeling_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Numerical Hydrogeologic Mode', 2, hydrogeo_modeling_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Site-wide Water Balance Model', 6, water_quality_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Surface Water Quality Model', 7, water_quality_id, 'system-mds', 'system-mds', 2);

    END;
$$;

-- INSERT nested 7. EFFLUENT DISCHARGES TO THE ENVIRONMENT requirements
DO $$
    DECLARE
        effluent_discharge_id INTEGER;
        discharge_id INTEGER;
        receiving_env_id INTEGER;

    BEGIN
        SELECT requirement_id INTO effluent_discharge_id
        FROM requirements
        WHERE description = 'EFFLUENT DISCHARGES TO THE ENVIRONMENT' AND version = 2;

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Domestic Water/Sewage Treatment', 1, effluent_discharge_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Effluent Discharge', 2, effluent_discharge_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO discharge_id
            FROM requirements
            WHERE description = 'Effluent Discharge' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Non-point Source Discharges', 1, discharge_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Receiving Environment Modelling', 3, effluent_discharge_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO receiving_env_id
            FROM requirements
            WHERE description = 'Receiving Environment Modelling' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Initial Dilution Zone', 1, receiving_env_id, 'system-mds', 'system-mds', 2);
    END;
$$;

-- INSERT nested 8. ENVIRONMENTAL EFFECTS ASSESSMENT requirements
DO $$
    DECLARE
        env_effects_id INTEGER;

    BEGIN
        SELECT requirement_id INTO env_effects_id
        FROM requirements
        WHERE description = 'ENVIRONMENTAL EFFECTS ASSESSMENT' AND version = 2;

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Aquatic Resources', 1, env_effects_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Terrestrial Resources', 2, env_effects_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Human Health', 3, env_effects_id, 'system-mds', 'system-mds', 2);
    END;
$$;

-- INSERT nested 9. ENVIRONMENTAL MONITORING requirements
DO $$
    DECLARE
        env_monitoring_id INTEGER;

    BEGIN
        SELECT requirement_id INTO env_monitoring_id
        FROM requirements
        WHERE description = 'ENVIRONMENTAL MONITORING' AND version = 2;

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Environmental Management System', 1, env_monitoring_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Discharge Monitoring Program', 2, env_monitoring_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Environment Monitoring Program', 3, env_monitoring_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Aquatic Effect Monitoring Program', 4, env_monitoring_id, 'system-mds', 'system-mds', 2);
    END;
$$;

-- INSERT nested 10. MANAGEMENT PLANS requirements
DO $$
    DECLARE
        management_plan_id INTEGER;
        metal_leaching_id INTEGER;

    BEGIN
        SELECT requirement_id INTO management_plan_id
        FROM requirements
        WHERE description = 'MANAGEMENT PLANS' AND version = 2;

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Environmental Management System', 1, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Erosion and Sediment Control Plan', 2, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Soil Management Plan', 3, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Construction Environmental Management Plan', 4, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Metal Leaching and Acid Rock Drainage Management Plan', 5, management_plan_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO metal_leaching_id
            FROM requirements
            WHERE description = 'Metal Leaching and Acid Rock Drainage Management Plan' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Definition of PAG and Metal Leaching Materials', 1, metal_leaching_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('ML/ARD Management', 2, metal_leaching_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('ML/ARD Monitoring', 3, metal_leaching_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('ML/ARD Reporting', 4, metal_leaching_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Mine Site Water Management Plan', 6, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Vegetation Management Plan', 7, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Invasive Plant Management Plan', 8, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Wildlife Management Plan', 9, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Fugitive Dust Management Plan', 10, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Archaeological Management and Impact Mitigation Plan', 11, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Fuel Management and Spill Control Plan', 12, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Combustible Dust Management Plan', 13, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Chemicals and Materials Storage, Transfer, and Handling Plan', 14, management_plan_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Waste (Refuse and Emissions) Management Plan', 15, management_plan_id, 'system-mds', 'system-mds', 2);
    END;
$$;

-- INSERT nested 11. RECLAMATION LIABILITY COST ESTIMATE requirements
DO $$
    DECLARE
        reclamation_liability_id INTEGER;
        rlce_params_id INTEGER;
        required_components_id INTEGER;
        cost_categories_id INTEGER;
        infra_removal_id INTEGER;
        remediation_id INTEGER;
        reclamation_id INTEGER;
        mitigation_id INTEGER;
        staffing_id INTEGER;
        maintenance_id INTEGER;
        monitoring_reporting_id INTEGER;

    BEGIN
        SELECT requirement_id INTO reclamation_liability_id
        FROM requirements
        WHERE description = 'RECLAMATION LIABILITY COST ESTIMATE' AND version = 2;

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('RLCE Paramaters', 1, reclamation_liability_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO rlce_params_id
            FROM requirements
            WHERE description = 'RLCE Paramaters' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Time Period', 1, rlce_params_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Costing Scenarios', 2, rlce_params_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Progressive Reclamation', 3, rlce_params_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Third-party Costs', 4, rlce_params_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Revenue Streams', 5, rlce_params_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Mobilization/Demobilization', 6, rlce_params_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Project Management', 7, rlce_params_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Engineering/Consultating Fees', 8, rlce_params_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Contingency Plans', 9, rlce_params_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Discount Rates', 10, rlce_params_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Required Components', 2, reclamation_liability_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO required_components_id
            FROM requirements
            WHERE description = 'Required Components' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('RLCE Summary Report', 1, required_components_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('RLCE Spreadsheets', 2, required_components_id, 'system-mds', 'system-mds', 2);

        INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
        VALUES('Cost Categories', 3, reclamation_liability_id, 'system-mds', 'system-mds', 2);

            SELECT requirement_id INTO cost_categories_id
            FROM requirements
            WHERE description = 'Cost Categories' AND version = 2;

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Cost Category 1 - Infrastructure Removal', 1, cost_categories_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO infra_removal_id
                FROM requirements
                WHERE description = 'Cost Category 1 - Infrastructure Removal' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('General Requirements', 1, infra_removal_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Infrastructure Types', 2, infra_removal_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Cost Category 2 - Site Remediation', 2, cost_categories_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO remediation_id
                FROM requirements
                WHERE description = 'Cost Category 2 - Site Remediation' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Contaminated Sites Investigation', 1, remediation_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Soil Treatment', 2, remediation_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Cost Category 3 - Conventional Reclamation', 3, cost_categories_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO reclamation_id
                FROM requirements
                WHERE description = 'Cost Category 3 - Conventional Reclamation' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('General Requirements', 1, reclamation_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Mine Components', 2, reclamation_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Reclamation Activities', 3, reclamation_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Costs', 4, reclamation_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Cost Category 4 - Water Quality Mitigation', 4, cost_categories_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO mitigation_id
                FROM requirements
                WHERE description = 'Cost Category 4 - Water Quality Mitigation' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('General Requirements', 1, mitigation_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Capital costs', 2, mitigation_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Operating Costs', 3, mitigation_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Cost Category 5 - Site Staffing', 5, cost_categories_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO staffing_id
                FROM requirements
                WHERE description = 'Cost Category 5 - Site Staffing' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('General Requirements', 1, staffing_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Cost Category 6 - Site Maintenance', 6, cost_categories_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO maintenance_id
                FROM requirements
                WHERE description = 'Cost Category 6 - Site Maintenance' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('General Requirements', 1, maintenance_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Site Maintenance Items', 2, maintenance_id, 'system-mds', 'system-mds', 2);

            INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
            VALUES('Cost Category 7 - Site Monitoring and Reporting', 7, cost_categories_id, 'system-mds', 'system-mds', 2);

                SELECT requirement_id INTO monitoring_reporting_id
                FROM requirements
                WHERE description = 'Cost Category 7 - Site Monitoring and Reporting' AND version = 2;

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('General Requirements', 1, monitoring_reporting_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Monitoring Program', 2, monitoring_reporting_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Monitoring Costs', 3, monitoring_reporting_id, 'system-mds', 'system-mds', 2);

                INSERT INTO requirements (description, display_order, parent_requirement_id, create_user, update_user, version)
                VALUES('Reporting Costs', 4, monitoring_reporting_id, 'system-mds', 'system-mds', 2);
    END;
$$;



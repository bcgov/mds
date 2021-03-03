ALTER TABLE placer_operation ADD COLUMN planned_reclamation numeric(14,2);

UPDATE placer_operation po SET planned_reclamation = 
(SELECT total_disturbed_area FROM activity_summary asum 
WHERE po.activity_summary_id = asum.activity_summary_id);
update mine_party_appt
set
    status = cast(
        sub.new_status as mine_party_appt_status
    )
from (
        select
            -- Set the eor status to active if it has the latest start date for any eor for that TSF
            -- and it hasn't expired.
            -- Fall back to looking at the end date on a conflict.
            -- How? Partition EORs by TSF guid, sort by start/end date, assign active to the EOR on top of the
            -- list for each partition
            case
                when row_number() over (
                    partition by mpa.mine_tailings_storage_facility_guid
                    order by
                        mpa.start_date desc nulls last,
                        mpa.end_date desc nulls first
                ) = 1
                and (
                    mpa.end_date >= now()
                    or mpa.end_date is null
                )
                and mpa.start_date is not null then 'active'
                else 'inactive'
            end as new_status,
            mpa.mine_party_appt_guid
        from
            mine_party_appt mpa
            join mine_tailings_storage_facility mtsf on mpa.mine_tailings_storage_facility_guid = mtsf.mine_tailings_storage_facility_guid
        where
            mpa.mine_party_appt_type_code = 'EOR'
            and mpa.mine_tailings_storage_facility_guid is not null
    ) as sub
where
    mine_party_appt.mine_party_appt_guid = sub.mine_party_appt_guid
    and mine_party_appt.mine_party_appt_type_code = 'EOR'
    and mine_party_appt.status is null
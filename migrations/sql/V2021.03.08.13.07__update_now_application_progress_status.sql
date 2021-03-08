/*
if now_application_status_code = `RCO` 
	and REF/CON/PUB have not been started, 
	
    update now_application_status_code = 'REC' 
    	   and previous_application_status_code = 'PEV'
*/
with applications_with_duplicates as (
	select 
		nai.now_application_guid
		,na.now_application_id app_id
		,na.now_application_status_code 
		,nap.now_application_id 
	from public.now_application_identity nai 
	join public.now_application na on na.now_application_id = nai.now_application_id 
	left join public.now_application_progress nap on nap.now_application_id = nai.now_application_id 
	where na.now_application_status_code = 'RCO'
	and not exists (
		select now_application_id from public.now_application_progress nap2 
		where nap2.now_application_id = na.now_application_id 
		and nap2.application_progress_status_code in ('REF','CON','PUB')
	)
)
,grouped_applications as (
    select * from applications_with_duplicates as apd
    group by now_application_guid, app_id, now_application_id,now_application_status_code
    order by app_id)
update public.now_application na
set now_application_status_code = 'REC'
    ,previous_application_status_code = 'PEV'
where na.now_application_id = (select app_id from grouped_applications where app_id = na.now_application_id);


/*
if previous_application_status_code = 'RCO` 
and (now_application_status_code = "CDI" or "GVD")
and (REF/CON/PUB have not been started)
    update previous_application_status_code = 'REC'
*/
with applications_with_duplicates as (
	select 
		nai.now_application_guid
		,na.now_application_id app_id
		,na.now_application_status_code
		,nap.now_application_id 
	from public.now_application_identity nai 
	join public.now_application na on na.now_application_id = nai.now_application_id 
	left join public.now_application_progress nap on nap.now_application_id = nai.now_application_id 
	where 
	na.previous_application_status_code = 'RCO'
	and na.now_application_status_code in ('CDI', 'GVD')
	and not exists (
		select now_application_id from public.now_application_progress nap2 
		where nap2.now_application_id = na.now_application_id 
		and nap2.application_progress_status_code in ('REF','CON','PUB')
	)
) 
,grouped_applications as (
    select * from applications_with_duplicates as apd
    group by now_application_guid, app_id, now_application_id,now_application_status_code
    order by app_id)
update public.now_application na
set previous_application_status_code = 'REC'
where na.now_application_id = (select app_id from grouped_applications where app_id = na.now_application_id);
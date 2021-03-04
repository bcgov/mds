/*
if previous_application_status_code = 'RCO` 
and (now_application_status_code = "CDI" or "GVD")
and (REF/CON/PUB have not been started)
    update previous_application_status_code = 'REC'
*/
with referal_complete_applications as ( 
	select
	nai.now_application_guid 
	,na.now_application_id as app_id
	,na.now_application_status_code
	,nas.description
	,na.previous_application_status_code 
	,pnas.description 
	,nar.now_application_id
	from public.now_application_identity nai 
	join public.now_application na ON na.now_application_id = nai.now_application_id 
	join public.now_application_status nas on nas.now_application_status_code = na.now_application_status_code 
	join public.now_application_status pnas on pnas.now_application_status_code = na.previous_application_status_code 
	left join public.now_application_review nar on nar.now_application_id = na.now_application_id 
	where 
	nar.now_application_id is null
	and na.previous_application_status_code = 'RCO'
	and na.now_application_status_code in ('CDI', 'GVD') 
)

update public.now_application na
set previous_application_status_code = 'REC'
where na.now_application_id = (select app_id from referal_complete_applications where app_id = na.now_application_id);

/*
if now_application_status_code = `RCO` and REF/CON/PUB have not been started, 
    update now_application_status_code = 'REC' and previous_application_status_code = 'PEV'
*/

with referal_complete_applications as ( 
	select
	nai.now_application_guid 
	,na.now_application_id as app_id
	,na.now_application_status_code
	,nas.description
	,na.previous_application_status_code 
	,pnas.description 
	,nar.now_application_id
	from public.now_application_identity nai 
	join public.now_application na ON na.now_application_id = nai.now_application_id 
	join public.now_application_status nas on nas.now_application_status_code = na.now_application_status_code 
	join public.now_application_status pnas on pnas.now_application_status_code = na.previous_application_status_code 
	left join public.now_application_review nar on nar.now_application_id = na.now_application_id 
	where 
	nar.now_application_id is null
	and na.now_application_status_code = 'RCO'
)

update public.now_application na
set now_application_status_code = 'REC',
    previous_application_status_code = 'PEV'
where na.now_application_id = (select app_id from referal_complete_applications where app_id = na.now_application_id );

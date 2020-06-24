#Code goes in app.cli_jobs.etl.permit_etl

#select mmspmt where sta_cd contains ('z','Z','a','A')
### MAX(permit_cid), combo_id = mine_no + permit_no + recv_dt + iss_dt
### most recent now number for that combo_id

#SOURCE 1 [118-192] Permit Contacts
#join permit_list.permit_cid to mmsccc on permit_cid = cid
### if multiple contacts, look for 'Y' in 4th position
### if only one (or none with 'Y' in 4th pos), take it anyways
## union these two lists
## extract details join permit_cid, contact_cid to mmsccn.cid and mmscmp
#--# permittee_nm = mmscmp.cmp_nm -- JOINED THROUGH MMSCCS

#SOURCE 2 [196-218] Notice of Work Contacts
### get permit_cid where contact details weren't in above union
## extract details from mmsnow join w permit_cid to mmsnow.cid and now.cmp_cd to mmscmp
#--# permittee_nm = mmscmp.cmp_nm -- JOINED THROUGH MMSNOW

# SOURCE 3 [222-254] MMSMIN Contacts
### get permit_cid missed from source 1 and 2
### mmsmin.entered_date - 'XXXX/XX/XX' then current_date else parse date
### get details from mmsmin table mmsmin.cmp_nm,ctel_no, cemail
#--# permittee_nm = mmsmin.cmp_nm

#[256-348] Permittee Names
#converge permitee_info (permit_cid, effective_date, permitee_nm, tel_no, email)
#split into permittee_orgs (pattern match) or permittee_person
## permittee_person party_name parsing

#[351-382] Permittee Contact Phone Number
# Remove any none numeric characters, remove garbage, Format and save

#[403-574] UPDATE/INSERT ETL_PERMIT
#make tmp table with data, mark new_permits, and new_permitees.
#Except Major mine permits
#TODO handle updating permits that are used by major and regional (probably doesn't exist)

#------
# FROM DATA CLEANUP TEAM EXCEL:

#Permit Approved: MMSPMT.APPR_DT
# *Not in Core? Possibly same as issued date in all cases
#Permit Issued: MMSPMT.ISS_DT
#Permit End Date / Expiry: mmspmt.permit_expiry_dt

# Permittee
# In Jason's words, we need to do "3a-1-2-3b" nonsense
# Take Permittee from Mine, unless there are more than one permit
# THERE IS ANOTHER DEFINITION OF A PERMITTEE: "Permittee" checkbox on NoW. Not sure what table
#MMSCCC.CID (cid = now number) used to join to the MMSNOW table.
#MMSCCN.CID (cid is the unique number for the contact in the MMSCCN table). This joins to the MMSCCC table (using the CID_CCN column). There is a column called TYPE_IND... where the 4th value = Y it denotes a Permittee.
# MMSMIN.CMP_CD - joins to MMSCMP, CMP_NM is name
# Note: Where PERMITTEE is the permittee CONTACT selected on the Notice of Work:
#name = MMSCCN.NAME + MMSCCN.L_NAME
#address = MMSCCN.STREET + MMSCCN.CITY + MMSCCN.PROV + MMSCCN.POST_CD
#phone = MMSCCN.PHONE / MMSCCN.CELL
#email = MMSCCN.EMAIL
#company = MMSCCN.CMP_CD (links to MMSCMP table for Company Details)"

#--------------------
# Permit ETL Step 2 insert into MDS

# Only updates the update user, update time, and status for permits from MMS [600-618]

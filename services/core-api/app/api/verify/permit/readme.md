##Verify Permit

The verify permit endpoints exist for integration purposes and do not follow the typical conventions of our API. They attempt to replicate and oracle package that enforces rules around whether an applicant can submit a notice of work.

###Business Rules

This notification allows you to submit a notice of deemed authorization for one of the following three options:

1. Induced Polarization Surveys Using Exposed Electrodes, if you hold a valid mineral or coal exploration permit.
2. Exploration Drill Programs and Induced Polarization Surveys in the Permitted Area of Disturbance of an Operating, Producing Mineral or Coal Mine (M or C permit – not MX or CX)
3. Extending the Term of Mineral or Coal Exploration Activities by up to Two Years if you hold a mineral or coal permit which is at least 30 days before its its authorization end date. The term can only be extended once.

If there are no concerns raised by a Mines Inspector within the 30 day notification period, you may begin the activity on or after the start date indicated in your notification.

Order in Council No. 134, the Mines Act Permit Regulation, establishes that certain mining exploration activities are deemed authorized under an existing Mines Act permit. These activities include:

1. Induced polarization (IP) surveys using exposed electrodes where an exploration permit is held;
2. Mineral or coal exploration drill programs and IP surveys in the permitted area of disturbance of a producing mineral or coal mine that is currently operating; and
3. Extending the term of mineral or coal exploration activities by up to two years.

###verify/permit/mine logic

- For every permit with a given permit number:
  - If the associated mine is of status Operating:
    - If the type of deemed authorization is INDUCED, is it a CX or MX permit?
      - If true, then add the mine and mine details to the allowable list of results.
    - If it is NOT INDUCED, is it a C or M permit?
      - If true, then add the mine and mine details to the allowable list of results.

###verify/permit/now logic

- For every permit with a given permit number:
  - If the associated mine is of status Operating and it is a CX or MX permit:
    - Does it have an assocated permit or permit amendment that is within 30 days of its authorization end date?
      - If false, then add the permit and permit details to the allowable list of results.

###original logic

#####MMS Mine Types

CX: COAL EXPLORATION
ES: EXPLORATION SURFACE
EU: EXPLORATION UNDERGROUND
CS: COAL SURFACE
CU: COAL UNDERGROUND
MS: MINERAL SURFACE
MU: MINERAL UNDERGROUND
IU: INDUCED UNDERGROUND
IS: INDUCED SURFACE

```
 /*-----------------------------------------
  VerifyPermitNoW ()
  -------------------------------------------*/
  procedure VerifyPermitNoW  (
    a_PermitNumber In varchar2
  , a_Timestamp Out Date
  , a_Result Out varchar2
  , a_NoWInfo Out varchar2
  , a_ResponseMessage Out varchar2
) is

    cursor now_cur is
      select mmsnow.cid, mmsnow.mine_No, mmsnow.str_dt, to_char(mmsnow.end_dt,'FMMon dd, yyyy' ) end_dt, mmsmin.mine_typ, mmspmt.permit_no, trunc(end_dt)- trunc(sysdate)
      from mmsnow,mmsmin, mmspmt
      where mmsmin.mine_no = mmsnow.mine_no and mmsnow.cid = mmspmt.cid
        and TRIM(mine_typ) IN ('CX','ES','EU')
        and trunc(sysdate) >=str_dt and trunc(sysdate) <=end_dt
        and mmsmin.sta_cd = 'A'
        and trunc(end_dt)- trunc(sysdate) >=30
        and trim(permit_no) = ParsePermit(trim(a_PermitNumber)) and permit_no is not null
        order by to_char(mmsnow.end_dt,'YYYYMMDD' ) ;

    e_PermitVerify exception;

    v_rec_count number:=0;
    v_err_count number:=0;
    a_permit varchar(30);

  begin
    a_Timestamp := sysdate;
    a_NoWInfo := null;
    a_permit := ParsePermit(trim(a_PermitNumber));

    select count(1) into v_rec_count from mmsadmin.mmspmt where trim(permit_no) = trim(a_permit) and permit_no is not null ;
    if a_permit is not null and v_rec_count >=1 then   -- Is a valid permit number
    v_rec_count := 0;
    ---------------------------------------
    ------------Term Extensions
    ---------------------------------------

        for v_now_cur IN now_cur
        loop
          v_rec_count := v_rec_count + 1;
          a_NoWInfo := a_NoWInfo || trim(v_now_cur.cid) || ' - ' || trim(v_now_cur.end_dt) || chr(13) || chr(10) ;
        end loop;

        -- Successfully found a mine(s)
        if v_rec_count >= 1 then
          a_NoWInfo := substr(a_NoWInfo,1,length(a_NoWInfo)-2);
          a_Result := 'Success';
          a_ResponseMessage := null;
        else -- Otherwise error (No Valid Mines
          a_Result := 'Failure';
          a_NowInfo := null;
          a_ResponseMessage := 'NoValidNoWsForPermit';
        end if;

    else
      raise e_PermitVerify ;
    end if;

    exception
      when e_PermitVerify then
        a_Result := 'Failure';
        a_NoWInfo := null;
        a_ResponseMessage := 'InvalidPermitNumber';
      when others then
        a_Result := 'Failure';
        a_NoWInfo := null;
        a_ResponseMessage := 'Unhandled Excpetion';
  end VerifyPermitNoW ;


 /*-----------------------------------------
  VerifyPermitMine ()
  -------------------------------------------*/
  procedure VerifyPermitMine  (
    a_PermitNumber In varchar2
  , a_TypeofDeemedAuth In varchar2
  , a_Timestamp Out Date
  , a_Result Out varchar2
  , a_MineInfo Out varchar2
  , a_ResponseMessage Out varchar2
) is

    cursor mines_cur_ip is
     select distinct mmsmin.mine_no, mmsadmin.mmsmin.mine_typ, mmsmin.mine_nm
            from mmsadmin.mmsmin,mmsadmin.mmspmt
            where mmspmt.mine_no = mmsmin.mine_no
            and TRIM(mine_typ) IN ('CX','ES','EU')
            and mmsmin.sta_cd = 'A'
            and trim(permit_no) = ParsePermit(trim(a_PermitNumber)) and permit_no is not null ;

    cursor mines_cur_dp is
     select distinct mmsmin.mine_no, mmsadmin.mmsmin.mine_typ, mmsmin.mine_nm
            from mmsadmin.mmsmin,mmsadmin.mmspmt
            where mmspmt.mine_no = mmsmin.mine_no
            and TRIM(mine_typ) IN ('CS','CU','MS','MU','IS','IU')
            and mmsmin.sta_cd = 'A'
            and trim(permit_no) = ParsePermit(trim(a_PermitNumber)) and permit_no is not null ;

    e_PermitVerify exception;

    v_rec_count number:=0;
    v_err_count number:=0;
    a_permit varchar(30);

  begin
    a_Timestamp := sysdate;
    a_MineInfo := null;
    a_permit := ParsePermit(trim(a_PermitNumber));

    select count(1) into v_rec_count from mmsadmin.mmspmt where trim(permit_no) = trim(a_permit) and permit_no is not null ;

    if a_permit is not null and v_rec_count >=1 then   -- Is a valid permit number
    v_rec_count := 0;
    ---------------------------------------
    ------------IP SURVEYS (Induced)
    ---------------------------------------
      if upper(a_TypeofDeemedAuth) = 'INDUCED' then

        for v_mines_cur_ip IN mines_cur_ip
        loop
          v_rec_count := v_rec_count + 1;
          a_MineInfo := a_MineInfo || trim(v_mines_cur_ip.mine_no) || ' - ' || trim(v_mines_cur_ip.mine_nm) || chr(13) || chr(10) ;
        end loop;

        -- Successfully found a mine(s)
        if v_rec_count >= 1 then
          a_MineInfo := substr(a_MineInfo,1,length(a_MineInfo)-2);
          a_Result := 'Success';
          a_ResponseMessage := null;
        else -- Otherwise error (No Valid Mines
          a_Result := 'Failure';
          a_MineInfo := null;
          a_ResponseMessage := 'NoValidMinesForPermit';
        end if;

    ---------------------------------------
    ------------DRILL PROGRAM (Drill)
    ---------------------------------------

      else

        for v_mines_cur_dp IN mines_cur_dp
        loop
          v_rec_count := v_rec_count + 1;
          a_MineInfo := a_MineInfo || trim(v_mines_cur_dp.mine_no) || ' - ' || trim(v_mines_cur_dp.mine_nm) || chr(13) || chr(10) ;
        end loop;

        -- Successfully found a mine(s)
        if v_rec_count >= 1 then
          a_MineInfo := substr(a_MineInfo,1,length(a_MineInfo)-2);
          a_Result := 'Success';
          a_ResponseMessage := null;
        else -- Otherwise error
          a_Result := 'Failure';
          a_MineInfo := null;
          a_ResponseMessage := 'NoValidMinesForPermit';
        end if;
      end if;

    else
      raise e_PermitVerify ;
    end if;

    exception
      when e_PermitVerify then
        a_Result := 'Failure';
        a_MineInfo := null;
        a_ResponseMessage := 'InvalidPermitNumber';
      when others then
        a_Result := 'Failure';
        a_MineInfo := null;
        a_ResponseMessage := 'Unhandled Exception';
  end VerifyPermitMine ;
```

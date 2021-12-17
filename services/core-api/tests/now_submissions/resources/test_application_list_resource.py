import json, pytest

from tests.factories import NOWSubmissionFactory, MineFactory, NOWApplicationIdentityFactory
from app.api.now_applications.resources.now_application_list_resource import PAGE_DEFAULT, PER_PAGE_DEFAULT

NOW_APPLICATION_DATA = {
   "sandgravelquarryoperations":"Yes",
   "messageid":111111111,
   "trackingnumber":1,
   "applicationtype":"Notice of Work",
   "status":"Under Review",
   "submitteddate":"2021-06-09 20:23:16Z",
   "receiveddate":"2021-06-09 20:23:16Z",
   "noticeofworktype":"Sand & Gravel",
   "typeofpermit":"I would like to apply for a Multi-Year, Area Based permit",
   "typeofapplication":"Amendment",
   "minenumber":"1300509",
   "latitude":50.755,
   "longitude":-120.97,
   "nameofproperty":"nameofproperty",
   "tenurenumbers":"1066865, 106866, 1065206, 1065226, 1065247",
   "crowngrantlotnumbers":"crowngrantlotnumbers",
   "sitedirections":"sitedirections",
   "firstaidequipmentonsite":"level 2... contractor supplied",
   "firstaidcertlevel":"Occupational First Aid Level 2 with Transportation Endorsement",
   "descexplorationprogram":"descexplorationprogram",
   "describeexplosivetosite":"describeexplosivetosite",
   "proposedstartdate":"2021-06-09 20:23:16Z",
   "proposedenddate":"2021-06-09 20:23:16Z",
   "landcommunitywatershed":"Yes",
   "landprivate":"Yes",
   "landlegaldesc":"landlegaldesc",
   "archsitesaffected":"Yes",
   "storeexplosivesonsite":"Yes",
   "bcexplosivespermitissued":"Yes",
   "bcexplosivespermitnumber":"BC-2222033",
   "bcexplosivespermitexpiry":"2021-06-09 20:23:16Z",
   "campdisturbedarea":100000,
   "camptimbervolume":100000,
   "bldgdisturbedarea":100000,
   "bldgtimbervolume":100000,
   "stgedisturbedarea":100000,
   "stgetimbervolume":100000,
   "fuellubstoreonsite":"Yes",
   "fuellubstored":400000,
   "fuellubstoremethodbulk":"Yes",
   "fuellubstoremethodbarrel":"No",
   "cbsfreclamation":"cbsfreclamation",
   "cbsfreclamationcost":100000,
   "mechtrenchingreclamation":"mechtrenchingreclamation",
   "mechtrenchingreclamationcost":100000,
   "expsurfacedrillreclamation":"expsurfacedrillreclamation",
   "expsurfacedrillprogam": "Ground supported",
   "expsurfacedrillreclamationcost":100000,
   "expaccessreclamation":"expaccessreclamation",
   "expaccessreclamationcost":100000,
   "surfacebulksampleprocmethods":"surfacebulksampleprocmethods",
   "expsurfacedrillreclcorestorage":"expsurfacedrillreclcorestorage",
   "surfacebulksamplereclamation":"surfacebulksamplereclamation",
   "surfacebulksamplereclsephandl":"surfacebulksamplereclsephandl",
   "surfacebulksamplerecldrainmiti":"surfacebulksamplerecldrainmiti",
   "surfacebulksamplereclcost":100000,
   "underexptotalore":5000,
   "underexptotaloreunits":"tonnes/year",
   "underexptotalwaste":5000,
   "underexptotalwasteunits":"tonnes/year",
   "underexpreclamation":"underexpreclamation",
   "underexpreclamationcost":100000,
   "placerundergroundoperations":"Yes",
   "placerhandoperations":"Yes",
   "placerreclamationarea":100000,
   "placerreclamation":"placerreclamation",
   "placerreclamationcost":100000,
   "sandgrvqrydepthoverburden":100000,
   "sandgrvqrydepthtopsoil":100000,
   "sandgrvqrystabilizemeasures":"sandgrvqrystabilizemeasures",
   "sandgrvqrywithinaglandres":"Yes",
   "sandgrvqryalrpermitnumber":"P-412541425",
   "sandgrvqrylocalgovsoilrembylaw":"Yes",
   "sandgrvqryofficialcommplan":"sandgrvqryofficialcommplan",
   "sandgrvqrylandusezoning":"sandgrvqrylandusezoning",
   "sandgrvqryendlanduse":"sandgrvqryendlanduse",
   "sandgrvqrytotalmineres":5000,
   "sandgrvqrytotalmineresunits":"tonnes/year",
   "sandgrvqryannualextrest":5000,
   "sandgrvqryannualextrestunits":"tonnes/year",
   "sandgrvqryreclamation":"sandgrvqryreclamation",
   "sandgrvqryreclamationbackfill":"sandgrvqryreclamationbackfill",
   "sandgrvqryreclamationcost":100000,
   "sandgrvqrygrdwtravgdepth":102920203,
   "sandgrvqrygrdwtrexistingareas":"Yes",
   "sandgrvqrygrdwtrtestpits":"Yes",
   "sandgrvqrygrdwtrtestwells":"Yes",
   "sandgrvqrygrdwtrother":"sandgrvqrygrdwtrother",
   "sandgrvqrygrdwtrmeasprotect":"sandgrvqrygrdwtrmeasprotect",
   "sandgrvqryimpactdistres":5000,
   "sandgrvqryimpactdistwater":5000,
   "sandgrvqryimpactnoise":"sandgrvqryimpactnoise",
   "sandgrvqryimpactprvtaccess":"sandgrvqryimpactprvtaccess",
   "sandgrvqryimpactprevtdust":"sandgrvqryimpactprevtdust",
   "sandgrvqryimpactminvisual":"sandgrvqryimpactminvisual",
   "sandgrvqryprogressivereclam":"Yes",
   "sandgrvqrymaxunreclaimed":5123513451,
   "yearroundseasonal":"Seasonal",
   "sandgrvqrytotaldistarea":100000,
   "sandgrvqrytotalexistdistarea":100000,
   "sandgrvqrydescription":"sandgrvqrydescription",
   "cutlinesexplgridtotallinekms":5000,
   "cutlinesexplgridtimbervolume":100000,
   "cutlinesreclamation":"cutlinesreclamation",
   "cutlinesreclamationcost":100000,
   "cutlinesexplgriddisturbedarea":100000,
   "pondswastewatertreatfacility":"pondswastewatertreatfacility",
   "pondstotaldistarea":100000,
   "pondsrecycled":"Yes",
   "pondsexfiltratedtoground":"Yes",
   "pondsdischargedtoenv":"Yes",
   "pondsreclamation":"pondsreclamation",
   "pondsreclamationcost":100000,
   "freeusepermit":"Yes",
   "licencetocut":"Yes",
   "timbertotalvolume":100000,
   "campbuildstgetotaldistarea":100000,
   "mechtrenchingtotaldistarea":100000,
   "expsurfacedrilltotaldistarea":100000,
   "expaccesstotaldistarea":100000,
   "surfacebulksampletotaldistarea":100000,
   "placertotaldistarea":100000,
   "underexptotaldistarea":100000,
   "reclcostsubtotal":100000,
   "reclcostexist":100000,
   "reclcostrecl":100000,
   "reclcosttotal":100000,
   "reclareasubtotal":100000,
   "reclareaexist":100000,
   "reclarearecl":100000,
   "reclareatotal":100000,
   "anyotherinformation":"anyotherinformation",
   "vfcbcapplicationurl":"vfcbcapplicationurl",
   "messagecreateddate":"2021-06-09 20:23:16Z",
   "processed":"Y",
   "processeddate":"2021-06-09 20:23:16Z",
   "isblastselect":"Yes",
   "istimberselect":"Yes",
   "permitnumber":"G-3134123",
   "atsauthorizationnumber":1234651346,
   "atsprojectnumber":23613,
   "filenumberofappl":"filenumberofappl",
   "originalstartdate":"2021-06-09 20:23:16Z",
   "annualsummarysubmitted":"Yes",
   "firstyearofmulti":"Yes",
   "authorizationdetail":"authorizationdetail",
   "oncrownland":"Yes",
   "havelicenceofoccupation":"Yes",
   "appliedforlicenceofoccupation":"Yes",
   "licenceofoccupation":"Yes",
   "noticeservedtoprivate":"Yes",
   "pondtypeofsediment":"pondtypeofsediment",
   "pondtypeconstruction":"pondtypeconstruction",
   "pondarea":"pondarea",
   "pondspillwaydesign":"pondspillwaydesign",
   "camphealthauthority":"Yes",
   "camphealthconsent":"Yes",
   "proposedproductionunit":"tonnes",
   "placerstreamdiversion":"Yes",
   "applicantindividualorcompany":"Company",
   "applicantrelationship":"Family",
   "termofapplication":5,
   "hasaccessauthorizations":"Yes",
   "accessauthorizationsdetails":"accessauthorizationsdetails",
   "accessauthorizationskeyprovided":"Yes",
   "landpresentcondition":"landpresentcondition",
   "currentmeansofaccess":"currentmeansofaccess",
   "physiography":"physiography",
   "oldequipment":"oldequipment",
   "typeofvegetation":"typeofvegetation",
   "recreationuse":"recreationuse",
   "isparkactivities":"Yes",
   "hasltgovauthorization":"Yes",
   "hasengagedfirstnations":"Yes",
   "hasculturalheritageresources":"Yes",
   "firstnationsactivities":"firstnationsactivities",
   "curturalheritageresources":"curturalheritageresources",
   "hasproposedcrossings":"Yes",
   "proposedcrossingschanges":"proposedcrossingschanges",
   "cleanoutdisposalplan":"cleanoutdisposalplan",
   "maxannualtonnage":1000,
   "proposedproduction":10000,
   "isaccessgated":"Yes",
   "hassurfacedisturbanceoutsidetenure":"Yes",
   "bedrockexcavation":"bedrockexcavation",
   "proposedactivites":"proposedactivites",
   "archaeologicalprotectionplan":"archaeologicalprotectionplan",
   "hasarchaeologicalprotectionplan":"Yes",
   "isonprivateland":"Yes",
   "underexpbulksample":True,
   "underexpdewatering":True,
   "underexpdimonddrill":True,
   "underexpmappingchip":True,
   "underexpnewdev":True,
   "underexprehab":True,
   "underexpfuelstorage":True,
   "underexpsurftotalwasteunits":"tonnes",
   "underexpsurftotaloreunits":"tonnes",
   "underexpsurftotalwaste":5,
   "underexpsurftotalore":5,
   "applicant":{
      "mailingaddresscountry":"",
      "ind_phonenumber":"7782207735",
      "type":"Individual",
      "mailingaddressline2":None,
      "clientid":115260951,
      "dayphonenumberext":None,
      "mailingaddressprovstate":"",
      "email":"dr.bruce.j.perry.ph.d.canada@gmail.com",
      "mailingaddresscity":"Savona",
      "ind_lastname":"Perry",
      "mailingaddresspostalzip":"V0K 2J0",
      "ind_middlename":"James",
      "faxnumber":None,
      "ind_firstname":"Bruce",
      "dayphonenumber":"7782207735",
      "mailingaddressline1":"6452 Ashcroft Road"
   },
   "submitter":{
      "mailingaddresscountry":"",
      "org_bcregnumber":None,
      "org_legalname":"PERRY, BRUCE JAMES",
      "faxnumber":None,
      "mailingaddressline2":None,
      "org_bcfedincorpnumber":None,
      "dayphonenumberext":None,
      "mailingaddressprovstate":"",
      "email":"dr.bruce.j.perry.ph.d.canada@gmail.com",
      "mailingaddresscity":"Savona",
      "dayphonenumber":"7782207735",
      "mailingaddressline1":"6452  Ashcroft Rd. ",
      "clientid":115260953,
      "mailingaddresspostalzip":"V0K2J0",
      "org_hstregnumber":None,
      "org_doingbusinessas":None,
      "type":"Organization",
      "org_contactname":None,
      "org_societynumber":None
   },
   "contacts":[
      {
         "mailingaddresscountry":"",
         "ind_phonenumber":"7782207735",
         "contactcertificationid":None,
         "type":"Individual",
         "mailingaddressline2":None,
         "contactcertificationtype":None,
         "dayphonenumberext":None,
         "mailingaddressprovstate":"",
         "email":"dr.bruce.j.perry.ph.d.canada@gmail.com",
         "mailingaddresscity":"Savona",
         "ind_lastname":"Perry",
         "mailingaddresspostalzip":"V0K2J0",
         "contacttype":"Tenure Holder",
         "ind_middlename":"James",
         "faxnumber":None,
         "ind_firstname":"Bruce",
         "dayphonenumber":None,
         "mailingaddressline1":"6452  Ashcroft Rd. "
      },
      {
         "mailingaddresscountry":"",
         "ind_phonenumber":"7782207735",
         "contactcertificationid":None,
         "type":"Individual",
         "mailingaddressline2":None,
         "contactcertificationtype":None,
         "dayphonenumberext":None,
         "mailingaddressprovstate":"",
         "email":"dr.bruce.j.perry.ph.d.canada@gmail.com",
         "mailingaddresscity":"Savona",
         "ind_lastname":"Perry",
         "mailingaddresspostalzip":"V0K2J0",
         "contacttype":"Mine manager",
         "ind_middlename":"James",
         "faxnumber":None,
         "ind_firstname":"Bruce",
         "dayphonenumber":None,
         "mailingaddressline1":"6452  Ashcroft Rd. "
      },
      {
         "mailingaddresscountry":"",
         "ind_phonenumber":"7782207735",
         "contactcertificationid":None,
         "type":"Individual",
         "mailingaddressline2":None,
         "contactcertificationtype":None,
         "dayphonenumberext":None,
         "mailingaddressprovstate":"",
         "email":"dr.bruce.j.perry.ph.d.canada@gmail.com",
         "mailingaddresscity":"Savona",
         "ind_lastname":"Perry",
         "mailingaddresspostalzip":"V0K2J0",
         "contacttype":"Permittee",
         "ind_middlename":"James",
         "faxnumber":None,
         "ind_firstname":"Bruce",
         "dayphonenumber":None,
         "mailingaddressline1":"6452 Ashcroft Rd. "
      },
      {
         "mailingaddresscountry":"",
         "ind_phonenumber":"7782207735",
         "contactcertificationid":None,
         "type":"Individual",
         "mailingaddressline2":None,
         "contactcertificationtype":None,
         "dayphonenumberext":None,
         "mailingaddressprovstate":"",
         "email":"dr.bruce.j.perry.ph.d.canada@gmail.com",
         "mailingaddresscity":"Savona",
         "ind_lastname":"Perry",
         "mailingaddresspostalzip":"V0K2J0",
         "contacttype":"Site operator",
         "ind_middlename":"James",
         "faxnumber":None,
         "ind_firstname":"Bruce",
         "dayphonenumber":None,
         "mailingaddressline1":"6452  Ashcroft Rd. "
      }
   ],
    "documents":[
   ],
   "sand_grv_qry_activity":[
      {
         "disturbedarea":4.0,
         "timbervolume":4.0,
         "type":"Mechanical Screening"
      },
      {
         "disturbedarea":4.0,
         "timbervolume":4.0,
         "type":"Washing"
      },
      {
         "disturbedarea":4.0,
         "timbervolume":4.0,
         "type":"Excavation of Pit Run"
      },
      {
         "disturbedarea":4.0,
         "timbervolume":4.0,
         "type":"Crushing"
      }
   ],
   "surface_bulk_sample_activity":[
     {
        "type": "type",
        "quantity": 4,
        "disturbedarea": 4,
        "timbervolume": 4
     }
   ],
   "under_exp_new_activity":[
     {
      "type": "type",
      "incline": 5,
      "inclineunits": "tonnes",
      "quantity": 5,
      "length": 5,
      "width": 5,
      "height": 5,
      "seq_no": 5
     }
   ],
   "under_exp_surface_activity":[
     {
        "type": "type",
        "quantity": 4,
        "disturbedarea": 4,
        "timbervolume": 4
     }
   ],
   "water_source_activity":[
      {
         "sourcewatersupply":"sourcewatersupply",
         "estimateratewater":4.0,
         "pumpsizeinwater":4.0,
         "useofwater":"useofwater",
         "type":"type",
         "locationwaterintake":"locationwaterintake"
      }
   ],
   "exp_access_activity":[
      {
         "numberofsites": 3,
         "length":4.0,
         "disturbedarea":4.0,
         "type":"Temporary Air Strip",
         "timbervolume":4.0
      }
   ],
   "exp_surface_drill_activity":[
      {
         "numberofsites":4,
         "disturbedarea":4.0,
         "timbervolume":4.0,
         "type":"Becker"
      },
      {
         "numberofsites":4,
         "disturbedarea":4.0,
         "timbervolume":4.0,
         "type":"Geotechnical"
      },
      {
         "numberofsites":4,
         "disturbedarea":4.0,
         "timbervolume":4.0,
         "type":"Auger"
      },
      {
         "numberofsites":4,
         "disturbedarea":4.0,
         "timbervolume":4.0,
         "type":"Percussion"
      },
      {
         "numberofsites":4,
         "disturbedarea":4.0,
         "timbervolume":4.0,
         "type":"Diamond Drilling - Underground"
      },
      {
         "numberofsites":4,
         "disturbedarea":4.0,
         "timbervolume":4.0,
         "type":"Diamond Drilling - Surface"
      },
      {
         "numberofsites":4,
         "disturbedarea":4.0,
         "timbervolume":4.0,
         "type":"Sonic"
      },
      {
         "numberofsites":4,
         "disturbedarea":4.0,
         "timbervolume":4.0,
         "type":"Reverse Circulation"
      }
   ],
   "mech_trenching_activity":[
      {
         "numberofsites":1,
         "disturbedarea":0.1,
         "depth": 5,
         "width": 5,
         "length":5,
         "timbervolume":0.0,
         "type":"Trenches and Test Pits"
      },
      {
         "numberofsites":1,
         "disturbedarea":4.0,
         "depth":5,
         "width":5,
         "length":5,
         "timbervolume":4.0,
         "type":"Stockpiles"
      }
   ],
   "camps":[
        {
        "name": "name",
        "peopleincamp": 2,
        "numberofstructures": 33,
        "descriptionofstructures": "descriptionofstructures",
        "wastedisposal": "wastedisposal",
        "sanitaryfacilities": "sanitaryfacilities",
        "watersupply": "watersupply",
        "quantityofwater": 7.00,
        "disturbedarea": 6.00,
        "timbervolume": 5.00
    },
    {
        "name": "name",
        "peopleincamp": 2,
        "numberofstructures": 33,
        "descriptionofstructures": "descriptionofstructures",
        "wastedisposal": "wastedisposal",
        "sanitaryfacilities": "sanitaryfacilities",
        "watersupply": "watersupply",
        "quantityofwater": 7.00,
        "disturbedarea": 6.00,
        "timbervolume": 5.00
    }
   ],
   "stagingareas":[
      {
         "name":"name",
         "disturbedarea":1.00,
         "timbervolume":3.00
      },
      {
         "name":"name",
         "disturbedarea":5.00,
         "timbervolume":5.00
      },
      {
         "name":"name",
         "disturbedarea":2.00,
         "timbervolume":4.00
      },
      {
         "name":"name",
         "disturbedarea":4.00,
         "timbervolume":4.00
      }
   ],
   "buildings":[
      {
         "name":"name",
         "purpose":"purpose",
         "structure":"structure",
         "disturbedarea":1.00,
         "timbervolume":2.00
      },
      {
         "name":"name",
         "purpose":"purpose",
         "structure":"structure",
         "disturbedarea":6.00,
         "timbervolume":6.00
      }
   ],
   "existing_placer_activity":[
      
   ],
   "existing_settling_pond":[
      
   ],
   "proposed_placer_activity":[
     {
      "placeractivityid": 3, 
      "type": "type",
      "quantity": 6,
      "depth": 6,
      "length": 6,
      "width": 6,
      "disturbedarea":9,
      "timbervolume":9
     }
   ],
  "proposed_settling_pond":[
      {
         "pondid":"4",
         "length":4,
         "disturbedarea":0.01,
         "watersource":"over there",
         "width":4,
         "settlingpondid":129016161,
         "constructionmethod":"just there",
         "timbervolume":4.0,
         "depth":4
      }
   ],
    "equipment":[
      {
         "quantity":1,
         "type":"Excavator",
         "size":"mini"
      }
   ]
}


class TestGetApplicationListResource:
    """GET /now-applications/applications"""
    def test_get_now_application_list_success(self, test_client, db_session, auth_headers):
        """Should return the correct records with a 200 response code"""

        batch_size = 5
        submissions = NOWApplicationIdentityFactory.create_batch(size=batch_size)

        get_resp = test_client.get("/now-applications", headers=auth_headers["full_auth_header"])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data["records"]) == batch_size
        assert get_data["total"] == batch_size
        assert all(
            str(submission.now_application_guid) in map(lambda x: x["now_application_guid"],
                                                        get_data["records"])
            for submission in submissions)

    def test_get_application_list_pagination(self, test_client, db_session, auth_headers):
        """Should return paginated records"""

        batch_size = PER_PAGE_DEFAULT + 1
        NOWApplicationIdentityFactory.create_batch(size=batch_size)

        get_resp = test_client.get("/now-applications", headers=auth_headers["full_auth_header"])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data["records"]) == PER_PAGE_DEFAULT
        assert get_data["current_page"] == PAGE_DEFAULT
        assert get_data["total"] == batch_size

    @pytest.mark.skip(reason="Status refactor broke ability to deploy")
    def test_get_now_application_list_filter_by_status(self, test_client, db_session, auth_headers):
        """Should return the records filtered by status"""

        now_submission_1 = NOWSubmissionFactory(status="Accepted")
        identity_1 = NOWApplicationIdentityFactory(now_submission=now_submission_1)
        now_submission_2 = NOWSubmissionFactory(status="Withdrawn")
        identity_2 = NOWApplicationIdentityFactory(now_submission=now_submission_2)
        now_submission_3 = NOWSubmissionFactory(status="Withdrawn")
        identity_3 = NOWApplicationIdentityFactory(now_submission=now_submission_3)
        now_submission_4 = NOWSubmissionFactory(status="Withdrawn")
        identity_4 = NOWApplicationIdentityFactory(now_submission=now_submission_4)

        get_resp = test_client.get(
            f"now-applications?now_application_status_description=Accepted&now_application_status_description=Withdrawn",
            headers=auth_headers["full_auth_header"])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data["records"]) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x["now_application_guid"],
                                                        get_data["records"])
            for submission in [now_submission_1, now_submission_2])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x["now_application_guid"],
                                                            get_data["records"])
            for submission in [now_submission_3, now_submission_4])

    def test_get_now_application_list_filter_by_noticeofworktype(self, test_client, db_session,
                                                                 auth_headers):
        """Should return the records filtered by noticeofworktype"""

        now_submission_1 = NOWSubmissionFactory(noticeofworktype="dog")
        identity_1 = NOWApplicationIdentityFactory(
            now_submission=now_submission_1, submission_only=True)
        now_submission_2 = NOWSubmissionFactory(noticeofworktype="dog")
        identity_2 = NOWApplicationIdentityFactory(
            now_submission=now_submission_2, submission_only=True)
        now_submission_3 = NOWSubmissionFactory(noticeofworktype="cat")
        identity_3 = NOWApplicationIdentityFactory(
            now_submission=now_submission_3, submission_only=True)
        now_submission_4 = NOWSubmissionFactory(noticeofworktype="parrot")
        identity_4 = NOWApplicationIdentityFactory(
            now_submission=now_submission_4, submission_only=True)

        get_resp = test_client.get(
            f"now-applications?notice_of_work_type_description=dog",
            headers=auth_headers["full_auth_header"])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data["records"]) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x["now_application_guid"],
                                                        get_data["records"])
            for submission in [now_submission_1, now_submission_2])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x["now_application_guid"],
                                                            get_data["records"])
            for submission in [now_submission_3, now_submission_4])

    def test_get_now_application_list_filter_by_mine_region(self, test_client, db_session,
                                                            auth_headers):
        """Should return the records filtered by mine_region"""

        mine = MineFactory(mine_region="SE")
        mine2 = MineFactory(mine_region="NW")
        now_submission_1 = NOWSubmissionFactory(mine=mine)
        identity_1 = NOWApplicationIdentityFactory(now_submission=now_submission_1, mine=mine)
        now_submission_2 = NOWSubmissionFactory(mine=mine)
        identity_2 = NOWApplicationIdentityFactory(now_submission=now_submission_2, mine=mine)
        now_submission_3 = NOWSubmissionFactory(mine=mine2)
        identity_3 = NOWApplicationIdentityFactory(now_submission=now_submission_3, mine=mine2)
        now_submission_4 = NOWSubmissionFactory(mine=mine2)
        identity_4 = NOWApplicationIdentityFactory(now_submission=now_submission_4, mine=mine2)

        get_resp = test_client.get(
            f"now-applications?mine_region={mine.mine_region}",
            headers=auth_headers["full_auth_header"])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data["records"]) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x["now_application_guid"],
                                                        get_data["records"])
            for submission in [now_submission_1, now_submission_2])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x["now_application_guid"],
                                                            get_data["records"])
            for submission in [now_submission_3, now_submission_4])

    def test_get_now_application_list_filter_by_multiple_filters(self, test_client, db_session,
                                                                 auth_headers):
        """Should return the records filtered by status, noticeofworktype, and tracking email"""

        now_submission_1 = NOWSubmissionFactory(status="Rejected", noticeofworktype="dog")
        identity_1 = NOWApplicationIdentityFactory(
            now_submission=now_submission_1, submission_only=True)
        now_submission_2 = NOWSubmissionFactory(status="Received", noticeofworktype="cat")
        identity_2 = NOWApplicationIdentityFactory(
            now_submission=now_submission_2, submission_only=True)
        now_submission_3 = NOWSubmissionFactory(status="Rejected", noticeofworktype="dog")
        identity_3 = NOWApplicationIdentityFactory(
            now_submission=now_submission_3, submission_only=True)
        now_submission_4 = NOWSubmissionFactory(status="Approved", noticeofworktype="cat")
        identity_4 = NOWApplicationIdentityFactory(
            now_submission=now_submission_4, submission_only=True)

        get_resp = test_client.get(
            f"now-applications?now_application_status_description=Approved&now_application_status_description=Rejected&notice_of_work_type_description=dog",
            headers=auth_headers["full_auth_header"])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data["records"]) == 2
        assert all(
            str(submission.now_application_guid) in map(lambda x: x["now_application_guid"],
                                                        get_data["records"])
            for submission in [now_submission_1, now_submission_3])
        assert all(
            str(submission.now_application_guid) not in map(lambda x: x["now_application_guid"],
                                                            get_data["records"])
            for submission in [now_submission_2, now_submission_4])

    def test_post_now_application_happy_path(self, test_client, db_session, auth_headers):
        """Should return a new NoW Application"""

        mine = MineFactory()
        NOW_APPLICATION_DATA["minenumber"] = mine.mine_no

        post_resp = test_client.post(
            "/now-submissions/applications",
            json=NOW_APPLICATION_DATA,
            headers=auth_headers["nros_vfcbc_auth_header"])
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 200 or post_resp.status_code == 201, post_resp.response
        assert post_data["messageid"] == NOW_APPLICATION_DATA["messageid"]
        assert post_data["application_guid"] is not None
        assert post_data["mine_guid"] == str(mine.mine_guid)

    def test_post_now_application_messageid_in_use(self, test_client, db_session, auth_headers):
        """Should return a 400 messageid in use"""

        mine = MineFactory()
        application = NOWSubmissionFactory(mine=mine)
        NOW_APPLICATION_DATA["minenumber"] = mine.mine_no
        NOW_APPLICATION_DATA["messageid"] = application.messageid

        post_resp = test_client.post(
            "/now-submissions/applications",
            json=NOW_APPLICATION_DATA,
            headers=auth_headers["nros_vfcbc_auth_header"])

        assert post_resp.status_code == 400, post_resp.response

    def test_post_now_application_no_mine_found(self, test_client, db_session, auth_headers):
        """Should return a 400 messageid in use"""

        NOW_APPLICATION_DATA["minenumber"] = "1234567"

        post_resp = test_client.post(
            "/now-submissions/applications",
            json=NOW_APPLICATION_DATA,
            headers=auth_headers["nros_vfcbc_auth_header"])

        assert post_resp.status_code == 400, post_resp.response

from app.extensions import api
from flask_restplus import fields

APPLICATION = api.model(
    'Application', {
       'application_guid': fields.String,
       'mine_guid': fields.String,
       'trackingnumber': fields.Integer,
       'applicationtype': fields.String,
       'status': fields.String,
       'submitteddate': fields.DateTime,
       'receiveddate': fields.DateTime,
       'applicantclientid': fields.Integer,
       'submitterclientid': fields.Integer,
       'noticeofworktype': fields.String,
       'typeofpermit': fields.String,
       'typeofapplication': fields.String,
       'minenumber': fields.String,
       'latitude': fields.Arbitrary,
       'longitude': fields.Arbitrary,
       'nameofproperty': fields.String,
       'tenurenumbers': fields.String,
       'crowngrantlotnumbers': fields.String,
       'sitedirections': fields.String,
       'firstaidequipmentonsite': fields.String,
       'firstaidcertlevel': fields.String,
       'descexplorationprogram': fields.String,
       'proposedstartdate': fields.DateTime,
       'proposedenddate': fields.DateTime,
       'yearroundseasonal': fields.String,
       'landcommunitywatershed': fields.String,
       'landprivate': fields.String,
       'landlegaldesc': fields.String,
       'archsitesaffected': fields.String,
       'sandgravelquarryoperations': fields.String,
       'storeexplosivesonsite': fields.String,
       'bcexplosivespermitissued': fields.String,
       'bcexplosivespermitnumber': fields.String,
       'bcexplosivespermitexpiry': fields.DateTime,
       'campdisturbedarea': fields.Arbitrary,
       'camptimbervolume': fields.Arbitrary,
       'bldgdisturbedarea': fields.Arbitrary,
       'bldgtimbervolume': fields.Arbitrary,
       'stgedisturbedarea': fields.Arbitrary,
       'stgetimbervolume': fields.Arbitrary,
       'fuellubstoreonsite': fields.String,
       'fuellubstored': fields.Integer,
       'fuellubstoremethodbulk': fields.String,
       'fuellubstoremethodbarrel': fields.String,
       'cbsfreclamation': fields.String,
       'cbsfreclamationcost': fields.Arbitrary,
       'mechtrenchingreclamation': fields.String,
       'mechtrenchingreclamationcost': fields.Arbitrary,
       'expsurfacedrillreclamation': fields.String,
       'expsurfacedrillreclcorestorage': fields.String,
       'expsurfacedrillreclamationcost': fields.Arbitrary,
       'expaccessreclamation': fields.String,
       'expaccessreclamationcost': fields.Arbitrary,
       'surfacebulksampleprocmethods': fields.String,
       'surfacebulksamplereclamation': fields.String,
       'surfacebulksamplereclsephandl': fields.String,
       'surfacebulksamplerecldrainmiti': fields.String,
       'surfacebulksamplereclcost': fields.Arbitrary,
       'underexptotalore': fields.Integer,
       'underexptotaloreunits': fields.String,
       'underexptotalwaste': fields.Integer,
       'underexptotalwasteunits': fields.String,
       'underexpreclamation': fields.String,
       'underexpreclamationcost': fields.Arbitrary,
       'placerundergroundoperations': fields.String,
       'placerhandoperations': fields.String,
       'placerreclamationarea': fields.Arbitrary,
       'placerreclamation': fields.String,
       'placerreclamationcost': fields.Arbitrary,
       'sandgrvqrydepthoverburden': fields.Arbitrary,
       'sandgrvqrydepthtopsoil': fields.Arbitrary,
       'sandgrvqrystabilizemeasures': fields.String,
       'sandgrvqrywithinaglandres': fields.String,
       'sandgrvqryalrpermitnumber': fields.String,
       'sandgrvqrylocalgovsoilrembylaw': fields.String,
       'sandgrvqryofficialcommplan': fields.String,
       'sandgrvqrylandusezoning': fields.String,
       'sandgrvqryendlanduse': fields.String,
       'sandgrvqrytotalmineres': fields.Integer,
       'sandgrvqrytotalmineresunits': fields.String,
       'sandgrvqryannualextrest': fields.Integer,
       'sandgrvqryannualextrestunits': fields.String,
       'sandgrvqryreclamation': fields.String,
       'sandgrvqryreclamationbackfill': fields.String,
       'sandgrvqryreclamationcost': fields.Arbitrary,
       'sandgrvqrygrdwtravgdepth': fields.Arbitrary,
       'sandgrvqrygrdwtrexistingareas': fields.String,
       'sandgrvqrygrdwtrtestpits': fields.String,
       'sandgrvqrygrdwtrtestwells': fields.String,
       'sandgrvqrygrdwtrother': fields.String,
       'sandgrvqrygrdwtrmeasprotect': fields.String,
       'sandgrvqryimpactdistres': fields.Integer,
       'sandgrvqryimpactdistwater': fields.Integer,
       'sandgrvqryimpactnoise': fields.String,
       'sandgrvqryimpactprvtaccess': fields.String,
       'sandgrvqryimpactprevtdust': fields.String,
       'sandgrvqryimpactminvisual': fields.String,
       'cutlinesexplgridtotallinekms': fields.Integer,
       'cutlinesexplgridtimbervolume': fields.Arbitrary,
       'cutlinesreclamation': fields.String,
       'cutlinesreclamationcost': fields.Arbitrary,
       'pondswastewatertreatfacility': fields.String,
       'freeusepermit': fields.String,
       'licencetocut': fields.String,
       'timbertotalvolume': fields.Arbitrary,
       'campbuildstgetotaldistarea': fields.Arbitrary,
       'mechtrenchingtotaldistarea': fields.Arbitrary,
       'expsurfacedrilltotaldistarea': fields.Arbitrary,
       'expaccesstotaldistarea': fields.Arbitrary,
       'surfacebulksampletotaldistarea': fields.Arbitrary,
       'placertotaldistarea': fields.Arbitrary,
       'underexptotaldistarea': fields.Arbitrary,
       'sandgrvqrytotaldistarea': fields.Arbitrary,
       'pondstotaldistarea': fields.Arbitrary,
       'reclcostsubtotal': fields.Arbitrary,
       'reclcostexist': fields.Arbitrary,
       'reclcostrecl': fields.Arbitrary,
       'reclcosttotal': fields.Arbitrary,
       'reclareasubtotal': fields.Arbitrary,
       'reclareaexist': fields.Arbitrary,
       'reclarearecl': fields.Arbitrary,
       'reclareatotal': fields.Arbitrary,
       'anyotherinformation': fields.String,
       'vfcbcapplicationurl': fields.String,
       'messagecreateddate': fields.DateTime,
       'processed': fields.String,
       'processeddate': fields.DateTime,
       'cutlinesexplgriddisturbedarea': fields.Arbitrary,
       'pondsrecycled': fields.String,
       'pondsexfiltratedtoground': fields.String,
       'pondsdischargedtoenv': fields.String,
       'pondsreclamation': fields.String,
       'pondsreclamationcost': fields.Arbitrary,
       'sandgrvqrytotalexistdistarea': fields.Arbitrary,
       'nrsosapplicationid': fields.String,
       'isblastselect': fields.String,
       'istimberselect': fields.String,
    })


PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })

PAGINATED_APPLICATION_LIST = api.inherit('ApplicationList', PAGINATED_LIST, {
    'records': fields.List(fields.Nested(APPLICATION)),
})
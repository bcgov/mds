import json
import math
from urllib import parse

from app.api.compliance.models.compliance_article import ComplianceArticle
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_definition_compliance_article_xref import \
    MineReportDefinitionComplianceArticleXref


# test non-paginated results
def test_post_mine_report_definition_no_pagination(test_client, db_session, auth_headers):
    active_records = db_session.query(MineReportDefinition).filter_by(active_ind=True).all()
    record_count = len(active_records)
    request_data = { "show_expired": True }
    
    get_resp = test_client.get(
        f'/mines/reports/definitions?{parse.urlencode(request_data)}',
        headers=auth_headers['full_auth_header'],
    )
    get_data = json.loads(get_resp.data.decode())
    
    assert get_resp.status_code == 200
    assert len(get_data['records']) == record_count
    assert(get_data['current_page']) == 1
    assert(get_data['total_pages']) == 1
    assert(get_data['items_per_page']) == record_count
    assert(get_data['total']) == record_count

from datetime import datetime
from pytz import timezone
from sqlalchemy import and_, or_


def test_get_mine_report_definition_without_expired(test_client, db_session, auth_headers):
    # Current datetime in the 'US/Pacific' timezone
    now = datetime.now(timezone('US/Pacific'))

    # Query only active MineReportDefinition records with valid ComplianceArticle dates
    active_records = (
        db_session.query(MineReportDefinition)
        .join(
            MineReportDefinitionComplianceArticleXref,
            MineReportDefinitionComplianceArticleXref.mine_report_definition_id == MineReportDefinition.mine_report_definition_id
        )
        .join(
            ComplianceArticle,
            ComplianceArticle.compliance_article_id == MineReportDefinitionComplianceArticleXref.compliance_article_id
        )
        .filter(MineReportDefinition.active_ind == True)
        .filter(
            and_(
                ComplianceArticle.effective_date <= now,
                or_(
                    ComplianceArticle.expiry_date.is_(None),
                    ComplianceArticle.expiry_date >= now
                )
            )
        )
        .all()
    )

    record_count = len(active_records)

    request_data = {}

    get_resp = test_client.get(
        f'/mines/reports/definitions?{parse.urlencode(request_data)}',
        headers=auth_headers['full_auth_header'],
    )
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert len(get_data['records']) == record_count

# test pagination
def test_post_mine_report_definition_pagination(test_client, db_session, auth_headers):
    PAGE = 2
    PER_PAGE = 10
    active_records = db_session.query(MineReportDefinition).filter_by(active_ind=True).all()
    record_count = len(active_records)
    request_data = {"page": PAGE, "per_page": PER_PAGE, "show_expired": True}

    get_resp = test_client.get(
        f'/mines/reports/definitions?{parse.urlencode(request_data)}',
        headers=auth_headers['full_auth_header'],
    )
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert len(get_data['records']) == PER_PAGE
    assert(get_data['current_page']) == PAGE
    assert(get_data['total_pages']) == math.ceil(record_count / PER_PAGE)
    assert(get_data['items_per_page']) == PER_PAGE
    assert(get_data['total']) == record_count

# test filters
def test_mine_report_definition_active_filter(test_client, db_session, auth_headers):
    all_records = db_session.query(MineReportDefinition).all()
    all_record_count = len(all_records)
    request_all_data = "active_ind=true&active_ind=false&show_expired=true"
    request_inactive_data = "active_ind=false&show_expired=true"
    print(request_all_data)

    get_all_resp = test_client.get(
        f'/mines/reports/definitions?{request_all_data}',
        headers=auth_headers['full_auth_header'],
    )
    get_all_data = json.loads(get_all_resp.data.decode())

    assert get_all_resp.status_code == 200
    assert len(get_all_data['records']) == all_record_count

    inactive_records = list(x for x in all_records if x.active_ind == False)
    inactive_record_count = len(inactive_records)

    get_inactive_resp = test_client.get(
        f'/mines/reports/definitions?{request_inactive_data}',
        headers=auth_headers['full_auth_header'],
    )
    get_inactive_data = json.loads(get_inactive_resp.data.decode())

    assert get_inactive_resp.status_code == 200
    assert len(get_inactive_data['records']) == inactive_record_count

def test_mine_report_definition_section_filter(test_client, db_session, auth_headers):    
    section_search = "2.3.1"
    request_data = {"section": section_search, "show_expired": True}

    get_resp = test_client.get(
        f'/mines/reports/definitions?{parse.urlencode(request_data)}',
        headers=auth_headers['full_auth_header'],
    )
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200

    for record in get_data['records']:
        compliance_article = record['compliance_articles'][0]
        assert compliance_article['section'] == '2'
        assert compliance_article['sub_section'] == '3'
        assert compliance_article['paragraph'] == '1'

def test_mine_report_definition_section_alpha_filter(test_client, db_session, auth_headers):
    active_records = db_session.query(MineReportDefinition).filter_by(active_ind=True).all()
    # find a record with a non numeric, lowercase sub_paragraph to search
    alpha_records = list(x for x in active_records 
                     if x.compliance_articles[0].sub_paragraph is not None and not x.compliance_articles[0].sub_paragraph.isnumeric() 
                     and x.compliance_articles[0].sub_paragraph.lower() == x.compliance_articles[0].sub_paragraph
                     )
    article_search = alpha_records[0].compliance_articles[0]
    # uppercase the sub_paragraph for searching
    section_data = [article_search.section, article_search.sub_section, article_search.paragraph, article_search.sub_paragraph.upper()]
    section_search_string = ".".join(section_data)
    request_data = {"section": section_search_string, "show_expired": True}

    get_resp = test_client.get(
        f'/mines/reports/definitions?{parse.urlencode(request_data)}',
        headers=auth_headers['full_auth_header'],
    )
    get_data = json.loads(get_resp.data.decode())

    guids = (x['mine_report_definition_guid'] for x in get_data['records'])

    assert get_resp.status_code == 200
    assert str(alpha_records[0].mine_report_definition_guid) in guids

    for record in get_data['records']:
        compliance_article = record['compliance_articles'][0]
        assert compliance_article['section'] == article_search.section
        assert compliance_article['sub_section'] == article_search.sub_section
        assert compliance_article['paragraph'] == article_search.paragraph
        assert compliance_article['sub_paragraph'].lower() == article_search.sub_paragraph.lower()
    

def test_mine_report_definition_report_type_filter(test_client, db_session, auth_headers):
    crr_request_data = {"is_prr_only": "false", "show_expired": True}
    prr_request_data = {"is_prr_only": "true", "show_expired": True}

    crr_get_resp = test_client.get(
        f'/mines/reports/definitions?{parse.urlencode(crr_request_data)}',
        headers=auth_headers['full_auth_header'],
    )
    crr_get_data = json.loads(crr_get_resp.data.decode())

    assert crr_get_resp.status_code == 200
    for record in crr_get_data['records']:
        assert record['is_prr_only'] == False

    prr_get_resp = test_client.get(
        f'/mines/reports/definitions?{parse.urlencode(prr_request_data)}',
        headers=auth_headers['full_auth_header'],
    )
    prr_get_data = json.loads(prr_get_resp.data.decode())
    
    assert prr_get_resp.status_code == 200
    for record in prr_get_data['records']:
        assert record['is_prr_only'] == True


def test_mine_report_definition_reg_auth_filter(test_client, db_session, auth_headers):
    active_records = db_session.query(MineReportDefinition).filter_by(active_ind=True).all()
    cpo_none_request_data = "regulatory_authority=CPO&regulatory_authority=NONE&show_expired=true"
    cpo_cim_request_data = "regulatory_authority=CPO&regulatory_authority=CIM&show_expired=true"

    # include a "None" value
    cn_get_resp = test_client.get(
        f'/mines/reports/definitions?{cpo_none_request_data}',
        headers=auth_headers['full_auth_header'],
    )
    cn_get_data = json.loads(cn_get_resp.data.decode())

    assert cn_get_resp.status_code == 200
    cn_expected_data = list(x for x in active_records if x.compliance_articles[0].cim_or_cpo == 'CPO' or x.compliance_articles[0].cim_or_cpo is None)
    assert len(cn_get_data['records']) == len(cn_expected_data)
    for record in cn_get_data['records']:
        assert record['compliance_articles'][0]['cim_or_cpo'] in ['CPO', None]    

    # don't include a "None" value
    cc_get_resp = test_client.get(
        f'/mines/reports/definitions?{cpo_cim_request_data}',
        headers=auth_headers['full_auth_header'],
    )
    cc_get_data = json.loads(cc_get_resp.data.decode())

    assert cc_get_resp.status_code == 200
    cc_expected_data = list(x for x in active_records if x.compliance_articles[0].cim_or_cpo in ['CPO', 'CIM'])
    assert len(cc_get_data['records']) == len(cc_expected_data)
    for record in cc_get_data['records']:
        assert record['compliance_articles'][0]['cim_or_cpo'] in ['CPO', 'CIM']   

# test sort
def test_mine_report_definition_sort_by_report_name_desc(test_client, db_session, auth_headers):
    request_data = {"sort_field": "report_name", "sort_dir": "desc"}
    
    get_resp = test_client.get(
        f'/mines/reports/definitions?{parse.urlencode(request_data)}',
        headers=auth_headers['full_auth_header'],
    )
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    for index, report in enumerate(get_data['records']):
        if index > 0:
            prev_record = get_data['records'][index - 1]
            assert report['report_name'].lower() < prev_record['report_name'].lower()

def test_mine_report_definition_sort_by_section(test_client, db_session, auth_headers):
    request_data = {"sort_field": "section", "sort_dir": "asc"}
    
    get_resp = test_client.get(
        f'/mines/reports/definitions?{parse.urlencode(request_data)}',
        headers=auth_headers['full_auth_header'],
    )
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    for index, report in enumerate(get_data['records']):
        if index > 0:
            prev_article = get_data['records'][index - 1]['compliance_articles'][0]
            current_article = report['compliance_articles'][0]

            assert int(current_article['section']) >= int(prev_article['section'])

            same_section = current_article['section'] == prev_article['section']
            if same_section:
                assert int(current_article['sub_section'] or 0) >= int(prev_article['sub_section'] or 0)

                same_sub_section = current_article['sub_section'] == prev_article['sub_section']
                if same_sub_section:
                    assert int(current_article['paragraph'] or 0) >= int(prev_article['paragraph'] or 0)

                    same_paragraph = current_article['paragraph'] == prev_article['paragraph']
                    if same_paragraph:
                        current_sp = current_article['sub_paragraph'] or ''
                        prev_sp = prev_article['sub_paragraph'] or ''
                        assert current_sp.lower() >= prev_sp.lower()

def test_mine_report_definition_sort_by_regulatory_authority(test_client, db_session, auth_headers):

    request_data = {'sort_field': 'regulatory_authority', 'sort_dir': 'asc', 'show_expired': True}
    
    get_resp = test_client.get(
        f'/mines/reports/definitions?{parse.urlencode(request_data)}',
        headers=auth_headers['full_auth_header'],
    )
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    reg_auth_values = list(report['compliance_articles'][0]['cim_or_cpo'] or "None" for report in get_data['records'])

    for index, reg_auth_val in enumerate(reg_auth_values):
        if index > 0:
            prev_val = reg_auth_values[index - 1]
            assert reg_auth_val >= prev_val

def test_post_mine_report_definition_success(test_client, db_session, auth_headers):
    request_data = {
        "report_name": "Test Report Name",
        "description": "This is a test description for the report.",
        "mine_report_due_date_type_code": 'ANV',
        "mine_report_due_date_period_months": 12,
        "report_type": "CRR",
        "is_common": True,
    }

    post_resp = test_client.post(
        '/mines/reports/definitions',
        headers=auth_headers['core_edit_code'],
        json=request_data
    )
    post_data = json.loads(post_resp.data.decode())

    # Assertions
    assert post_resp.status_code == 201
    assert post_data['report_name'] == request_data['report_name']
    assert post_data['description'] == request_data['description']
    assert post_data['mine_report_due_date_type'] == request_data['mine_report_due_date_type_code']
    assert post_data['due_date_period_months'] == request_data['mine_report_due_date_period_months']
    assert post_data['is_prr_only'] == False
    assert post_data['is_common'] == request_data['is_common']

    # Ensure the object was created in the database
    db_object = db_session.query(MineReportDefinition).filter_by(report_name="Test Report Name").first()
    assert db_object is not None
    assert db_object.description == request_data['description']

# Test missing required fields in POST request
def test_post_mine_report_definition_missing_required_fields(test_client, auth_headers):
    request_data = {
        "description": "Missing required fields",
        "mine_report_due_date_type_code": "ANV",
        "mine_report_due_date_period_months": 12,
    }

    post_resp = test_client.post(
        '/mines/reports/definitions',
        headers=auth_headers['core_edit_code'],
        json=request_data
    )
    post_data = json.loads(post_resp.data.decode())

    # Assertions
    assert post_resp.status_code == 400
    assert "Input payload validation failed" in post_data['message']


def test_post_mine_report_definition_duplicate_report_name(test_client, db_session, auth_headers):
    mine_report_definition = db_session.query(MineReportDefinition).first()

    request_data = {
        "report_name": mine_report_definition.report_name,
        "description": "This is a test description for the report.",
        "mine_report_due_date_type_code": 'ANV',
        "mine_report_due_date_period_months": 12,
        "report_type": "CRR",
        "is_common": False
    }

    post_resp = test_client.post(
        '/mines/reports/definitions',
        headers=auth_headers['core_edit_code'],
        json=request_data
    )

    # Assertions
    assert post_resp.status_code == 400


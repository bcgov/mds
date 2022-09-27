import json
import uuid

from tests.factories import MineIncidentFactory, MineFactory


class TestGetMineIncident:
    """GET /mines/{mine_guid}/incidents/{mine_incident_guid}"""

    def test_get_mine_incident(self, test_client, db_session, auth_headers):
        """Should return the correct mine incident and a 200 response code"""

        mine_incident = MineIncidentFactory()

        get_resp = test_client.get(
            f'/mines/{mine_incident.mine_guid}/incidents/{mine_incident.mine_incident_guid}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['mine_incident_guid'] == str(mine_incident.mine_incident_guid)

    def test_get_mine_incidents_wrong_mine_guid(self, test_client, db_session, auth_headers):
        """Should return a 404 when the mine_incident does not exist on the provided mine"""

        mine_incident = MineIncidentFactory()
        mine = MineFactory()

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/mine_incidents/{mine_incident.mine_incident_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 404


class TestPutMineIncident:
    """PUT /mines/{mine_guid}/incidents/{mine_incident_guid}"""

    def test_put_mine_incident(self, test_client, db_session, auth_headers):
        """Should return the updated mine_incident record"""

        mine_incident = MineIncidentFactory()
        incident = MineIncidentFactory()
        data = {
            'incident_timestamp': '2019-01-01 00:00',
            'reported_timestamp': '2019-01-01 00:00',
            'incident_description': incident.incident_description,
            'reported_by_name': incident.reported_by_name,
            'reported_by_email': incident.reported_by_email,
            'reported_by_phone_no': incident.reported_by_phone_no,
            'reported_by_phone_ext': incident.reported_by_phone_ext,
            'emergency_services_called': incident.emergency_services_called,
            'number_of_injuries': incident.number_of_injuries,
            'number_of_fatalities': incident.number_of_fatalities,
            'reported_to_inspector_party_guid': incident.reported_to_inspector_party_guid,
            'responsible_inspector_party_guid': incident.responsible_inspector_party_guid,
            'determination_inspector_party_guid': incident.determination_inspector_party_guid,
            'proponent_incident_no': incident.proponent_incident_no,
            'determination_type_code': incident.determination_type_code,
            'followup_investigation_type_code': incident.followup_investigation_type_code,
            'followup_inspection': incident.followup_inspection,
            'followup_inspection_date': '2019-01-01',
            'status_code': incident.status_code,
            'dangerous_occurrence_subparagraph_ids': incident.dangerous_occurrence_subparagraph_ids,
            'recommendations': incident.recommendations,
            'immediate_measures_taken': incident.immediate_measures_taken,
            'injuries_description': incident.injuries_description,
            'johsc_worker_rep_name': incident.johsc_worker_rep_name,
            'johsc_worker_rep_contacted': incident.johsc_worker_rep_contacted,
            'johsc_management_rep_name': incident.johsc_management_rep_name,
            'johsc_management_rep_contacted': incident.johsc_management_rep_contacted
        }

        put_resp = test_client.put(
            f'/mines/{mine_incident.mine_guid}/incidents/{mine_incident.mine_incident_guid}',
            headers=auth_headers['full_auth_header'],
            json=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 200, put_resp.response
        assert put_data['incident_timestamp'] == data['incident_timestamp']
        assert put_data['reported_timestamp'] == data['reported_timestamp']
        assert put_data['incident_description'] == data['incident_description']
        assert put_data['reported_by_name'] == data['reported_by_name']
        assert put_data['reported_by_email'] == data['reported_by_email']
        assert put_data['reported_by_phone_no'] == data['reported_by_phone_no']
        assert put_data['reported_by_phone_ext'] == data['reported_by_phone_ext']
        assert put_data['emergency_services_called'] == data['emergency_services_called']
        assert put_data['number_of_injuries'] == data['number_of_injuries']
        assert put_data['number_of_fatalities'] == data['number_of_fatalities']
        assert put_data['reported_to_inspector_party_guid'] == data['reported_to_inspector_party_guid']
        assert put_data['responsible_inspector_party_guid'] == data['responsible_inspector_party_guid']
        assert put_data['determination_inspector_party_guid'] == data['determination_inspector_party_guid']
        assert put_data['proponent_incident_no'] == data['proponent_incident_no']
        assert put_data['determination_type_code'] == data['determination_type_code']
        assert put_data['followup_investigation_type_code'] == data['followup_investigation_type_code']
        assert put_data['followup_inspection'] == data['followup_inspection']
        assert put_data['followup_inspection_date'] == data['followup_inspection_date']
        assert put_data['status_code'] == data['status_code']
        assert put_data['immediate_measures_taken'] == data['immediate_measures_taken']
        assert put_data['injuries_description'] == data['injuries_description']
        assert put_data['johsc_worker_rep_name'] == data['johsc_worker_rep_name']
        assert put_data['johsc_worker_rep_contacted'] == data['johsc_worker_rep_contacted']
        assert put_data['johsc_management_rep_name'] == data['johsc_management_rep_name']
        assert put_data['johsc_management_rep_contacted'] == data['johsc_management_rep_contacted']

        assert all(x in data['dangerous_occurrence_subparagraph_ids'] for x in put_data['dangerous_occurrence_subparagraph_ids'])
        assert all(x in data['recommendations'] for x in put_data['recommendations'])

import csv
import os
import uuid

from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from tests.factories import (
    PermitAmendmentDocumentFactory,
    PermitConditionsFactory,
    PermitExtractionTaskFactory,
    create_mine_and_permit,
)
from tests.status_code_gen import RandomConditionCategoryCode, RandomConditionStatusCode


def test_export_permit_conditions_success(test_client, db_session):
    # Create test data using the helper function but with no default conditions
    mine, permit = create_mine_and_permit(num_permit_amendments=1)
    amendment = permit.permit_amendments[0]
    
    # Create document and task
    doc = PermitAmendmentDocumentFactory(permit_amendment=amendment)
    task = PermitExtractionTaskFactory(permit_amendment=amendment, permit_amendment_document=doc)

    # Override any existing conditions with just our test ones
    PermitConditions.query.delete()

    conditions = [
        PermitConditionsFactory(
            permit_amendment=amendment,
            condition_category_code=RandomConditionCategoryCode(),
            permit_condition_status_code=RandomConditionStatusCode(),
            _step="Step 1",
            display_order=1,
            condition="Test condition 1"
        ),
        PermitConditionsFactory(
            permit_amendment=amendment, 
            condition_category_code=RandomConditionCategoryCode(),
            permit_condition_status_code=RandomConditionStatusCode(),
            _step="Step 2",
            display_order=2,
            condition="Test condition 2"
        )
    ]

    # Test export function
    from app.cli_commands.export_permit_conditions import export_permit_conditions
    filename = export_permit_conditions(str(amendment.permit_amendment_guid))

    # Verify file was created and contents
    assert os.path.exists(filename)
    with open(filename, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)
        
        assert len(rows) == 2
        assert rows[0]['step'] == "Step 1"
        assert rows[0]['category'] != ""
        assert rows[0]['status'] != ""
        assert rows[0]['display_order'] == '1'
        assert rows[0]['mine_number'] == mine.mine_no
        assert rows[0]['mine_name'] == mine.mine_name
        assert rows[0]['permit'] == permit.permit_no
        assert rows[0]['document_name'] == doc.document_name
        assert rows[0]['document_manager_guid'] == str(doc.document_manager_guid)

    # Cleanup
    os.remove(filename)



def test_export_permit_conditions_not_found(test_client, db_session):
    """Test handling of valid but non-existent UUID"""
    from app.cli_commands.export_permit_conditions import export_permit_conditions
    random_guid = str(uuid.uuid4())
    filename = export_permit_conditions(random_guid)
    assert filename is None


def test_export_permit_conditions_no_conditions(test_client, db_session):
    # Create amendment without conditions by passing conditions=0 to create_mine_and_permit
    mine, permit = create_mine_and_permit(
        num_permit_amendments=1
    )
    amendment = permit.permit_amendments[0]
    
    PermitConditions.query.delete()
    
    from app.cli_commands.export_permit_conditions import export_permit_conditions
    filename = export_permit_conditions(str(amendment.permit_amendment_guid))
    assert filename is None

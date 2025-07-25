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


def test_bulk_export_and_index_permit_conditions_cli(monkeypatch, test_client, db_session, cli_runner):
    """Test the bulk_export_and_index_permit_conditions CLI command."""
    from app import create_app
    app = create_app()
    called = {}
    def fake_find_all_guids_with_extracted_conditions(is_now=None):
        called['find'] = is_now
        return ["guid1", "guid2", "guid3"]
    def fake_export_and_index_permit_amendments(permit_amendment_guids, is_manual):
        called['export'] = permit_amendment_guids
        called['is_manual'] = is_manual
        return None

    monkeypatch.setattr(
        "app.api.mines.permits.permit_amendment.models.permit_amendment.PermitAmendment.find_all_guids_with_extracted_conditions",
        fake_find_all_guids_with_extracted_conditions
    )
    monkeypatch.setattr(
        "app.api.mines.permits.permit_conditions.tasks.export_and_index_permit_amendments",
        fake_export_and_index_permit_amendments
    )

    # Test with no arguments
    result = cli_runner.invoke(app.cli, ["bulk_export_and_index_permit_conditions"])
    assert result.exit_code == 0
    assert called['find'] is None
    assert called['export'] == ["guid1", "guid2", "guid3"]
    assert called['is_manual'] is True
    assert "Exporting and indexing 3 permit amendments" in result.output

    # Test with permit_type=NOW
    called.clear()
    result = cli_runner.invoke(app.cli, ["bulk_export_and_index_permit_conditions", "NOW"])
    assert result.exit_code == 0
    assert called['find'] is True
    assert called['export'] == ["guid1", "guid2", "guid3"]
    assert called['is_manual'] is True
    assert "Exporting and indexing 3 Notice of Work permit amendments" in result.output

    # Test with permit_type=MM
    called.clear()
    result = cli_runner.invoke(app.cli, ["bulk_export_and_index_permit_conditions", "MM"])
    assert result.exit_code == 0
    assert called['find'] is False
    assert called['export'] == ["guid1", "guid2", "guid3"]
    assert called['is_manual'] is True
    assert "Exporting and indexing 3 Major Mine permit amendments" in result.output

    # Test with amendment_guids
    called.clear()
    result = cli_runner.invoke(app.cli, ["bulk_export_and_index_permit_conditions","--amendment_guids", "abc,def"])
    assert result.exit_code == 0
    assert called['export'] == ["abc", "def"]
    assert called['is_manual'] is True
    assert "Exporting and indexing permit amendments with guids: abc,def" in result.output

    # Test with batch_size (should batch)
    called.clear()
    result = cli_runner.invoke(app.cli, ["bulk_export_and_index_permit_conditions","--batch_size", "2"])
    assert result.exit_code == 0
    assert called['export'] == ["guid3"]
    assert called['is_manual'] is True
    assert "Exporting and indexing 3 permit amendments" in result.output

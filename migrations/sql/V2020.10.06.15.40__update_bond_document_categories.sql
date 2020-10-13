UPDATE bond_document_type set description = 'No Interest Payable Form' where bond_document_type_code = 'NIA';
delete from mine_documents where bond_document_type_code = 'BAL';
DELETE FROM bond_document_type WHERE bond_document_type_code = 'BAL';
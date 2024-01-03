import unittest
from unittest.mock import MagicMock
from app.services.object_store_storage_service import ObjectStoreStorageService

class TestObjectStoreStorageService(unittest.TestCase):
    def setUp(self):
        # Create a mock client for testing
        self.mock_client = MagicMock()
        ObjectStoreStorageService._client = self.mock_client

    def test_create_multipart_upload(self):
        # Test the create_multipart_upload method

        # Mock the create_multipart_upload response
        self.mock_client.create_multipart_upload.return_value = {
            'UploadId': 'test_upload_id'
        }

        # Create an instance of the ObjectStoreStorageService
        storage_service = ObjectStoreStorageService()

        # Call the create_multipart_upload method
        result = storage_service.create_multipart_upload('test_key', 100)

        # Assert that the uploadId is returned correctly
        self.assertEqual(result['uploadId'], 'test_upload_id')

        # Assert that the create_multipart_upload method of the client is called with the correct parameters
        self.mock_client.create_multipart_upload.assert_called_once_with(
            Bucket='test_bucket',
            Key='test_key',
            Expires=datetime.now() + timedelta(days=1),
            ContentType='application/pdf'
        )

    def test_create_multipart_upload_urls(self):
        # Test the create_multipart_upload_urls method

        # Create an instance of the ObjectStoreStorageService
        storage_service = ObjectStoreStorageService()

        # Call the create_multipart_upload_urls method
        result = storage_service.create_multipart_upload_urls('test_key', 'test_upload_id', 100)

        # Assert that the result is a list with the correct length
        self.assertEqual(len(result), 20)

        # Assert that each upload URL has the correct structure
        for i, upload_url in enumerate(result):
            self.assertEqual(upload_url['part'], i + 1)
            self.assertEqual(upload_url['size'], 5 * 1024 * 1024)
            self.assertEqual(upload_url['url'], f'test_upload_url_{i + 1}')

    # Add more test methods to cover other functionalities of the code

if __name__ == '__main__':
    unittest.main()import unittest

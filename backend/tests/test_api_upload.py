from unittest.mock import patch, Mock


def test_upload_init_with_valid_request(client):
    """正常なアップロード初期化リクエストのテスト"""
    with patch("app.services.upload.storage.Client") as mock_client:
        mock_blob = Mock()
        mock_bucket = Mock()
        mock_bucket.blob.return_value = mock_blob
        mock_client.return_value.bucket.return_value = mock_bucket

        with patch(
            "app.services.upload.generate_signed_url",
            return_value="https://example.com/signed-url",
        ):
            response = client.post(
                "/api/upload/init",
                json={
                    "fileName": "test_video.mp4",
                    "fileSize": 1024,
                    "contentType": "video/mp4",
                },
            )

            assert response.status_code == 200
            data = response.json()
            assert "uploadUrl" in data
            assert "fileId" in data
            assert data["uploadUrl"] == "https://example.com/signed-url"


def test_upload_init_with_empty_filename(client):
    """空のファイル名でのエラーテスト"""
    response = client.post(
        "/api/upload/init",
        json={"fileName": "", "fileSize": 1024, "contentType": "video/mp4"},
    )

    assert response.status_code == 500
    assert "fileName cannot be empty" in response.json()["detail"]


def test_upload_init_without_extension(client):
    """拡張子なしファイル名でのテスト"""
    with patch("app.services.upload.storage.Client") as mock_client:
        mock_blob = Mock()
        mock_bucket = Mock()
        mock_bucket.blob.return_value = mock_blob
        mock_client.return_value.bucket.return_value = mock_bucket

        with patch(
            "app.services.upload.generate_signed_url",
            return_value="https://example.com/signed-url",
        ):
            response = client.post(
                "/api/upload/init",
                json={
                    "fileName": "test_video",
                    "fileSize": 1024,
                    "contentType": "video/quicktime",
                },
            )

            assert response.status_code == 200
            data = response.json()
            assert "uploadUrl" in data
            assert "fileId" in data

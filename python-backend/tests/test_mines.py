import json

def test_mines(app):
    client = app.test_client()
    resp = client.get('/mines')
    data = json.loads(resp.data.decode())
    assert resp.status_code == 200

def test_mines(app):
    client = app.test_client()
    resp = client.get('/mine')
    data = json.loads(resp.data.decode())
    assert resp.status_code == 405

class MockCeleryTask:
    def update_state(self, state, meta):
        pass

class MockContext:
    def get():
        return MockCeleryTask()
    def update_state(self, state, meta):
        pass

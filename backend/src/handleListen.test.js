const handleListen = require('./handleListen');

test('should call log with Example app...', () => {
  const PORT = 3000;
  const log = jest.fn();
  handleListen(log, PORT);
  expect(log.mock.calls).toHaveLength(1);
  expect(log.mock.calls[0][0]).toBe(`Example app listening on port ${PORT.toString()}!`);
});

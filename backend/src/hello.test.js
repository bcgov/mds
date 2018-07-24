const hello = require('./hello');

test('should call res.send with Hello World!', () => {
  const send = jest.fn();
  const res = {
    send,
  };
  hello({}, res);
  expect(send.mock.calls).toHaveLength(1);
  expect(send.mock.calls[0][0]).toBe('Hello World!');
});

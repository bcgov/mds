import { retryOnFail } from "./retry";

describe("retryOnFail", () => {
  it("should return the result of the function if it succeeds on the first try", async () => {
    const mockFn = jest.fn().mockResolvedValue("success");
    const result = await retryOnFail(mockFn, 3, 10);
    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should retry the function until it succeeds", async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error("failed"))
      .mockRejectedValueOnce(new Error("failed"))
      .mockResolvedValue("success");
    const result = await retryOnFail(mockFn, 3, 10);
    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it("should throw an error if the function fails on all retries", async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error("failed"));
    await expect(retryOnFail(mockFn, 3, 10)).rejects.toThrow("failed");
    expect(mockFn).toHaveBeenCalledTimes(4);
  });
});

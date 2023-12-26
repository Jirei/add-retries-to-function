import { describe, test, expect, vi } from "vitest";
import { AfterRetriesError, addRetriesToFunction } from ".";

describe("addRetriesToFunction", () => {
  test("retries the function the correct number of times before throwing error if always unsuccessful", async () => {
    const testFn = vi.fn((_a, _b) => {
      throw new Error();
    });
    const testFnWithRetries = addRetriesToFunction({ fn: testFn, maxInterval: 0, numberOfRetries: 2 });
    await expect(testFnWithRetries(1, 2)).rejects.toThrowError(AfterRetriesError);
    expect(testFn).toHaveBeenCalledTimes(3);
    expect(testFn).toHaveBeenCalledWith([1, 2]);
  });
  test("stop retrying if successful", async () => {
    let attemptsBeforeGivingRightAnswer = 1;
    const testFn = vi.fn((a, b) => {
      if (attemptsBeforeGivingRightAnswer === 0) return a + b;
      attemptsBeforeGivingRightAnswer--;
      throw new Error();
    });
    const testFnWithRetries = addRetriesToFunction({ fn: testFn, maxInterval: 0, numberOfRetries: 2 });
    await testFnWithRetries(1, 2);
    expect(testFn).toHaveBeenCalledTimes(2);
    expect(testFn).toHaveBeenCalledWith([1, 2]);
  });
  test("stop retrying if shouldStopTrying return true", async () => {
    let attemptsBeforeStopping = 2;
    const testFn = vi.fn((_a, _b) => {
      attemptsBeforeStopping--;
      throw new Error();
    });
    const testFnWithRetries = addRetriesToFunction({ fn: testFn, maxInterval: 0, numberOfRetries: 2, shouldStopTrying: () => attemptsBeforeStopping === 0 });
    await expect(testFnWithRetries(1, 2)).rejects.toThrowError(AfterRetriesError);
    expect(testFn).toHaveBeenCalledTimes(2);
    expect(testFn).toHaveBeenCalledWith([1, 2]);
  });
  test("correctly waits between 0 and X ms between retries", async () => {
    const times: number[] = [];
    let startOrPrevious = Date.now();
    const testFn = vi.fn((_a, _b) => {
      const now = Date.now();
      let timeSinceLast = Date.now() - startOrPrevious;
      times[times.length] = timeSinceLast;
      startOrPrevious = now;
      throw new Error();
    });
    const testFnWithRetries = addRetriesToFunction({ fn: testFn, maxInterval: 100, numberOfRetries: 10 });
    await expect(testFnWithRetries(1, 2)).rejects.toThrowError(AfterRetriesError);
    for (const time of times) {
      expect(time).toBeLessThanOrEqual(150); // add a bit of leeway just to be safe
    }
  });
  test("correctly calls provided log function", async () => {
    const testFn = vi.fn((_a, _b) => {
      throw new Error();
    });
    const logFn = vi.fn();
    const testFnWithRetries = addRetriesToFunction({ fn: testFn, maxInterval: 0, numberOfRetries: 2, loggingFn: logFn });
    await expect(testFnWithRetries(1, 2)).rejects.toThrowError(AfterRetriesError);
    expect(logFn).toHaveBeenCalledTimes(2);
    expect(logFn.mock.calls[0][0]).toBeInstanceOf(Error)
    expect(logFn.mock.calls[1][0]).toBeInstanceOf(Error)
  });
});


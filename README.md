This package is functional and has been tested but does not include documentation. It is primarily intended for personal use.

```ts
export function addRetriesToFunction<T extends AnyFn>({ fn, numberOfRetries = 2, maxInterval = 500, loggingFn, shouldStopTrying }: AddRetriesToFunctionArgs<T>) {
  return (...args: Parameters<T>) => addRetriesToFunctionInternal({ fn, args, numberOfRetries, maxInterval, loggingFn, shouldStopTrying });
}


async function addRetriesToFunctionInternal<T extends AnyFn>({ fn, args, numberOfRetries = 2, maxInterval = 500, loggingFn, shouldStopTrying }: AddRetriesToFunctionInternalArgs<T>):Promise<Awaited<ReturnType<T>>> {
  for (let i = 0; i < numberOfRetries + 1; i++) {
    try {
      return await fn(...args);
    } catch (e) {
      if (i === numberOfRetries || (shouldStopTrying && await shouldStopTrying(e))) throw new AfterRetriesError("Wrapping error around the last error", e);
      if (loggingFn) loggingFn(e);
      await wait(getRandomNumber(0, maxInterval));
    }
  }
  throw new AfterRetriesError("For some reason escaped the loop even though it shouldn't be possible");
}
```
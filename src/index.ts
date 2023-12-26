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

export class AfterRetriesError extends Error {
  cause: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
    this.name = "AfterRetriesError";
  }
}

export interface AddRetriesToFunctionArgs<T extends AnyFn> {
  fn: T;
  /** Default to 2 retries */
  numberOfRetries?: number;
  /** Default to 500 (500ms) */
  maxInterval?: number;
  loggingFn?: (e: any) => void;
  shouldStopTrying?: (e: unknown) => (boolean | Promise<boolean>);
}

interface AddRetriesToFunctionInternalArgs<T extends AnyFn> {
  fn: T;
  args: Parameters<T>;
  numberOfRetries: number;
  maxInterval: number;
  loggingFn?: (e: any) => void;
  shouldStopTrying?: (e: unknown) => (boolean | Promise<boolean>);
}



export function getRandomNumber(min: number, max: number) {
  // algorithm comes from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export async function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export type AnyFn = (...args: any[]) => any;
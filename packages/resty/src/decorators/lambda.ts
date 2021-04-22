import {Inject} from "@typeix/di";

export const LAMBDA_EVENT = "@typeix:LAMBDA_EVENT";
/**
 * Lambda event
 * @decorator
 * @function
 * @name LambdaEvent
 *
 * @description
 * Inject lambda event in your request.ts
 */
export function LambdaEvent() {
  return Inject(LambdaEvent);
}

export const LAMBDA_CONTEXT = "@typeix:LAMBDA_CONTEXT";
/**
 * Lambda event
 * @decorator
 * @function
 * @name LambdaContext
 *
 * @description
 * Inject lambda event in your request.ts
 */
export function LambdaContext() {
  return Inject(LambdaContext);
}

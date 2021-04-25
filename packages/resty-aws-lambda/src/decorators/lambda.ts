import {Inject} from "@typeix/resty";
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

import {Inject} from "@typeix/di";

export const PATH_PARAM = "@typeix:param:";
/**
 * @since 1.0.0
 * @decorator
 * @function
 * @name PathParam
 *
 * @description
 * Define PathParam metadata to deliver it from router
 *
 * @example
 * import {PathParam, ControllerResolver, Methods, Inject} from "@typeix/resty";
 *
 * \@Controller({
 *   path: "/"
 * })
 * class MyController{
 *
 *     \@Inject() userService: UserService;
 *
 *     \@GET("/<id:(\d+)>/partner")
 *     getUserById(@PathParam("id") id: number) {
 *        return this.userService.findById(id);
 *     }
 * }
 */
export function PathParam(token: string): ParameterDecorator {
  return Inject(PATH_PARAM + token);
}

import {Injectable} from "@typeix/resty";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }
}

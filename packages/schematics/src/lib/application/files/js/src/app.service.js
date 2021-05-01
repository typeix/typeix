import {Injectable} from "@typeix/resty";

@Injectable()
export class AppService {
  getHello() {
    return 'Hello World!';
  }
}

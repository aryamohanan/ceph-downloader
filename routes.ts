
import { Application, Request, Response } from 'express';
import { HealthStatusController } from './lib/controllers';
class Route {
  path: string;
  action: (request: Request, response: Response) => {};
  verb: RestVerb;

  constructor(verb: RestVerb, path: string, action: (request: Request, response: Response) => {}) {
    this.path = path;
    this.action = action;
    this.verb = verb;
  }
}
enum RestVerb {
  show = 'get'
}
export class Routes {
  private app: Application;
  routes: Array<Route> = [];

  private controllers = {
    healthStatusController: new HealthStatusController(),
  }
  constructor(app: Application) {
    this.app = app;
  }
  static call(app: any) {
    const instance = new Routes(app);
    instance.call();
  }

  call() {
    this.routes.push(new Route(RestVerb.show, '/api/v1/status(||/0)', this.controllers.healthStatusController.show));
    this.routes.push(new Route(RestVerb.show, '/api/v1/status/1', this.controllers.healthStatusController.show1));
    this.routes.forEach((route) => {
      this.app[route.verb](route.path, route.action);
    });
  }
}
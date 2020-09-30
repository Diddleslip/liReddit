import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from "express";

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>; // Hovering over "em" will give you this
  req: Request & { session: Express.Session };
  res: Response;
};

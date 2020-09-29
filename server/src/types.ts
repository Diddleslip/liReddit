import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>; // Hovering over "em" will give you this
};

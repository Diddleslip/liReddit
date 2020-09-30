import "reflect-metadata"; // First
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import microConfig from "./mikro-orm.config";
import express from "express";

// --Apollo
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

// -- Resolvers
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

// -- Redis/sessions
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  orm.getMigrator().up();

  const app = express();

  // -- Redis declarations
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    // It's important we declare sessions first because we're using it inside Apollo
    session({
      name: "qid", // The name the sessions will be called in browser
      store: new RedisStore({
        client: redisClient,
        disableTouch: true, // Stops the session's-timer-reset when user interacts with server
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years expiration date
        httpOnly: true, // good for denying the cookie access to front end app
        sameSite: "lax", // Lax is a sameSite property that allows us to send cookies-
        // -despite getting sent from a different website
        secure: __prod__, // COOKIE ONLY WORKS IN HTTPS
      },
      saveUninitialized: false,
      secret: "isufbvhynsduhvn", // You want to hide this
      resave: false,
    })
  );

  // --ApolloClient
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false, // Turned off because it has classValidators
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("Server started on localhost:4000");
  });
  // const post = orm.em.create(Post, { title: "my first post" }); // Creates post data on save
  // await orm.em.persistAndFlush(post); // Adds it to dB

  // const posts = await orm.em.find(Post, {}); // Finds all post
  // console.log(posts); // Logs them
};

main().catch((err) => {
  console.error(err);
});

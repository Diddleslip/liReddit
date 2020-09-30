import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from "argon2";

@InputType() // InputTypes we use for @Arguements
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType() // ObjectTypes we return from our Mutations
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    console.log("THIS IS SESSION: ", req.session);
    // This query returns who you are based on cookies
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  // CREATES A NEW USER
  @Mutation(() => UserResponse) // Sets query or mutation and passes the type that the function returns
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      };
    }
    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 2",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(options.password); // Hashed the given password
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505") {
        //|| err.detail.include("already exists")) {
        // Duplicate username error
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
      // console.log("message: ", err);
    }

    // --Store user id session
    // This will set a cookie on the user
    // Keep them logged in
    req.session.userId = user.id;

    return { user };
  }

  // LOGS IN A USER
  @Mutation(() => UserResponse) // Sets query or mutation and passes the type that the function returns
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      // Conditional errors
      return {
        errors: [
          {
            field: "username",
            message: "that username does not exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, options.password); // Verifies password
    if (!valid) {
      return {
        // Conditional errors
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;
    // req.session.randomKey = "asd123"; -- We can add as many key/value pairs to session object

    return { user };
  }
}

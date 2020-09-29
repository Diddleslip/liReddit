import { Query, Resolver } from "type-graphql";

@Resolver() // Test run query
export class HelloResolver {
  @Query(() => String) // Sets query or mutation and passes the type that the function returns
  hello() {
    return "Hello s";
  }
}

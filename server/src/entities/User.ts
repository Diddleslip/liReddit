import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType() // Initializes class for GraphQL
@Entity()
export class User {
  @Field() // Add Field to the columns in order for GraphQL to have access to them in queries
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field() // Commenting out these fields will hide the data from the schemas
  @Property({ type: "text", unique: true })
  username!: string;

  @Field()
  @Property({ type: "text" }) // Doesn't have @Field since we don't want to show password
  password!: string;
}

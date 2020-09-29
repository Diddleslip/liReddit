import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType() // Initializes class for GraphQL
@Entity()
export class Post {
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
  @Property({ type: "text" })
  title!: string;
}

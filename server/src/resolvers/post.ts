import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "./../entities/Post";
import { MyContext } from "src/types";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id") id: number, // The string id in this line is what we call the args in the GraphQL browser.
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id }); // Finds the post with the id and returns it
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title }); // Create post with title
    await em.persistAndFlush(post); // Add post to GraphQL
    return post;
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id }); // To update post, find the title with id
    if (!post) {
      // If no post available, return null
      return null;
    }
    if (typeof title !== "undefined") {
      // If new title is given, update title
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post; // Return post
  }
}

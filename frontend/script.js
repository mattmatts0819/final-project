window.addEventListener("DOMContentLoaded", async () => {
  try {
    //get all blog posts
    const blogPostResponse = await fetch("/blogs/");
    if (!blogPostResponse.ok) {
      throw new Error("failed to fetch blog posts");
    }
    const blogPosts = await blogPostResponse.json();

    // get all author details
    await Promise.all(
      blogPosts.map(async (blogPost) => {
        const authorResponse = await fetch("/users/" + blogPost.author);
        // ${blogPost.author}
        if (!authorResponse.ok) {
          throw new Error("Failed to fetch author details");
        }
        const authData = await authorResponse.json();
        blogPost.authorName = authData.authorName;
      })
    );

    //get all comment details
    await Promise.all(
      blogPosts.map(async (blogPost) => {
        await Promise.all(
          blogPost.comment.map(async (comment) => {
            const userResponse = await fetch("/users/" + comment.user);
            if (!userResponse.ok) {
              throw new Error("Failed to fetch user details");
            }
            const userData = await userResponse.json();
            comment.userName = userData.name;
          })
        );
      })
    );

    displayBlogPost(blogPosts);
  } catch (error) {
    console.error("Error fetching content", error.message);
  }
});

//func to diplay blog posts

async function displayBlogPost(blogPost) {
  const blogPostContainer = document.getElementById("blogPosts");
  blogPostContainer.innerHTML = "";

  blogPost.forEach((blogPost) => {
    const cardElement = document.createElement("div");

    const titleElement = document.createElement("H3");
    titleElement.textContent = blogPost.title;
    cardElement.appendChild(titleElement);

    const authorElement = document.createElement("p");
    authorElement.textContent = blogPost.authorName;
    cardElement.appendChild(authorElement);

    const contentElement = document.createElement("p");
    contentElement.textContent = blogPost.content;
    cardElement.appendChild(contentElement);

    const likesElement = document.createElement("p");
    likesElement.textContent = "    Likes: " + blogPost.likes;
    cardElement.appendChild(likesElement);

    const commentElement = document.createElement("ul");
    blogPost.comments.forEach((comment) => {
      let commentItem = document.createElement("li");
      commentItem.innerText =
        comment.name +
        ": " +
        comment.content +
        "       " +
        comment.likes +
        "Likes";
      // "${comment.userName}: ${comment.content}        ${comment.likes} Likes";
      commentElement.appendChild(commentItem);
    });
    blogPostContainer.appendChild(cardElement);
  });
}

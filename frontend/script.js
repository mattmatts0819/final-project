let loggedIn = false;
let userId;

window.addEventListener("DOMContentLoaded", async () => {
  await fetchAndDisplayBlogPosts();
});

async function fetchAndDisplayBlogPosts() {
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

    await displayBlogPost(blogPosts);
  } catch (error) {
    console.error("Error fetching content", error.message);
  }
}

//func to diplay blog posts

async function displayBlogPost(blogPost) {
  const blogPostContainer = document.getElementById("blog-post");
  blogPostContainer.innerHTML = "";

  blogPost.forEach((blogPost) => {
    const cardElement = createBlogPostCard(blogPost);
    blogPostContainer.appendChild(cardElement);
  });
}

function createBlogPostCard(blogPost) {
  const cardElement = document.createElement("div");
  cardElement.classList.add("blog-post-card");

  const titleElement = document.createElement("H5");
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
    commentElement.appendChild(commentItem);
  });

  return cardElement;
}

document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    // console.log(formData);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      const response = await fetch("/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login Failed. Try Again");
      }

      const data = await response.json();
      userId = data._id;
      loggedIn = true;

      console.log("login successful: ", data);

      document.getElementById("login-form-container").style.display = "none";
      document.getElementById("blog-form-container").style.display = "block";

      document.getElementById(
        "userGreeting"
      ).innerHTML = `<h4>Hello ${data.name} </h4>`;

      await fetchAndDisplayBlogPosts();
    } catch (error) {
      console.error("error: ", error.message);
      document.getElementById("validation").innerHTML =
        "<p>" + error.message + "</p>";
    } finally {
      event.target.reset();
    }
  });
document
  .getElementById("blog-post-form")
  .addEventListener("submit-post", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const title = formData.get("post-title");
    const content = formData.get("post-content");

    try {
      const response = await fetch("/blogs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, author: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create blog post. Try again.");
      }

      event.target.reset();

      await fetchAndDisplayBlogPosts();

      console.log("Blog post created succesfully");
    } catch (error) {
      console.error("error: ", error.message);

      const postValidation = document.getElementById("post-validation");
      postValidation.innerHTML = `<p>${error.message}</p>`;
    }
  });

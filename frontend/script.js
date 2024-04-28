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

async function displayBlogPost(blogPosts) {
  const blogPostContainer = document.getElementById("blog-post");
  blogPostContainer.innerHTML = "";

  blogPosts.forEach((blogPost) => {
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

  const postLikesButton = createLikeButton(blogPost.likes);

  postLikesButton.addEventListener("click", async () => {
    if (blogPost.liked || !loggedIn) {
      return;
    }
    try {
      const response = await fetch(`/blogs/like/${blogPost._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to like the blog post. Try Again");
      }
      blogPost.likes++;
      postLikesButton.querySelector(
        ".likes-count"
      ).textContent = `${blogPost.likes}`;
      blogPost.liked = true;
    } catch (error) {
      console.error("Error: ", error.message);
    }
  });
  cardElement.appendChild(postLikesButton);

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
  .addEventListener("submit", async (event) => {
    console.log("checkpoint 1");
    event.preventDefault();
    const formData = new FormData(event.target);
    const title = formData.get("post-title");
    const content = formData.get("post-content");

    console.log("checkpoint 2");

    try {
      const response = await fetch("/blogs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, author: userId }),
      });
      console.log("checkpoint 3");
      if (!response.ok) {
        console.log("error");
        throw new Error("Failed to create blog post. Try again.");
      }

      event.target.reset();
      console.log("checkpoint 4");
      await fetchAndDisplayBlogPosts();

      console.log("Blog post created succesfully");
    } catch (error) {
      console.error("error: ", error.message);
      console.log("checkpoint 5");
      const postValidation = document.getElementById("post-validation");
      postValidation.innerHTML = `<p>${error.message}</p>`;
    }
  });

function createLikeButton(likes) {
  const likesButton = document.createElement("button");
  likesButton.classList.add("likes-button");

  const heartIcon = document.createElement("img");
  heartIcon.classList.add("heart-icon");
  heartIcon.src = "public/like-icon.png";
  heartIcon.alt = "like";

  const likesCount = document.createElement("span");
  likesCount.textContent = `${likes}`;
  likesCount.classList.add("likes-count");

  likesButton.appendChild(heartIcon);
  likesButton.appendChild(likesCount);

  return likesButton;
}

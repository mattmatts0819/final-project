import express from "express";
import * as blogController from "../controllers/blogController.js";

const router = express.Router();

//route for getting all blogs
router.get("/", blogController.getAllBlogs);

//route for getting blog by ID
router.get("/:id", blogController.getBlogByID);

//route for creating a new blog post
router.post("/", blogController.createBlog);

//route for liking blog post
router.put("/like/:id", blogController.likeBlogPost);

//route for adding a comment
router.post("/:id/comment", blogController.addBlogComment);

//route for liking a blog comment
router.put("/:id/comment/like/:commentIndex", blogController.likeBlogComment);

//route for deleting a blog post
router.delete("/:id", blogController.deleteBlogPost);

export default router;

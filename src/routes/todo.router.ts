import express from "express"
import { validate } from "../middleware/validate.ts"
import { createTodo, deleteTodo, retrieveTodos, updateTodo } from "../controllers/todo.controller.ts";
import { authenticate } from "../middleware/authenticate.ts";
import { rateLimiter } from "../middleware/rateLimiter.ts";

const router = express.Router()

const windowMs = 60 * 60 * 1000;
const maxTries = 100;
const authRateLimiter = rateLimiter(windowMs, maxTries, (req) => req.user?.id ?? req.ip ?? "unknown")

router.post("/todos", authenticate, authRateLimiter, validate(["title", "description"]), createTodo)
router.put("/todos/:id", authenticate, authRateLimiter, validate(["title", "description"]), updateTodo)
router.delete("/todos/:id", authenticate, authRateLimiter, deleteTodo)
router.get("/todos", authenticate, authRateLimiter, retrieveTodos)

export default router;
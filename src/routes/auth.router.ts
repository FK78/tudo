import express  from "express"
import { register, login, refresh } from "../controllers/auth.controller.ts"
import { validate } from "../middleware/validate.ts"
import { rateLimiter } from "../middleware/rateLimiter.ts"

const router = express.Router()

router.post("/register", rateLimiter(60000, 5), validate(["name", "email", "password"]), register)
router.post("/login", validate(["email", "password"]), rateLimiter(60000, 5, (req) => (req.ip ?? "unknown") + ":" + (req.body.email ?? "unknown")), login)
router.post("/refresh", rateLimiter(60000, 10), validate(["refreshToken"]), refresh)


export default router
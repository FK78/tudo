import express from "express"
import authRouter from "./routes/auth.router.ts"
import todoRouter from "./routes/todo.router.ts"
import { pool } from "./db/db.ts"
import { errorHandler, routeNotFound } from "./middleware/errorHandler.ts"

const port = process.env.TUDO_PORT || 3000
const app = express()


app.set('trust proxy', 1);
app.use(express.json())

if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error("Token secrets must be set")
}

try {
  await pool.query("SELECT 1");
  console.log("DB Connected");
} catch (err) {
  console.error(err);
  process.exit(1);
}

app.use("/", authRouter)
app.use("/", todoRouter)

app.use(routeNotFound)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server is online at port ${port}`)
})
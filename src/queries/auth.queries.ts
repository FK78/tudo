import type { PoolClient } from "pg";
import { pool } from "../db/db.ts";
import type { UserRecord } from "../types/auth.ts";

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
}

const mapUserRow = (row: UserRow): UserRecord => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
});

export const createUser = async (
  name: string,
  email: string,
  hashedPassword: string,
): Promise<UserRecord> => {
  const result = await pool.query<UserRow>(
    "INSERT INTO users(name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    [name, email, hashedPassword],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to insert user");
  }
  return mapUserRow(row);
};

export const emailExists = async (email: string): Promise<boolean> => {
  const result = await pool.query(
    `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists`,
    [email],
  );
  return result.rows[0].exists;
};

export const findUserByEmail = async (
  email: string,
): Promise<UserRecord | null> => {
  const result = await pool.query<UserRow>(
    "SELECT id, name, email, password_hash FROM users WHERE email = $1",
    [email],
  );
  const row = result.rows[0];
  return row ? mapUserRow(row) : null;
};

export const findUserById = async (id: string, client?: PoolClient): Promise<UserRecord | null> => {
  const db = client || pool
  const result = await db.query<UserRow>(
    "SELECT id, name, email, password_hash FROM users WHERE id = $1",
    [id],
  );
  const row = result.rows[0]
  return row ? mapUserRow(row) : null;
};

import type { PoolClient } from "pg";
import { pool } from "../db/db.ts";
import type { RefreshToken, RevokedReason } from "../types/tokens.ts";

interface RefreshTokenRow {
  id: string;
  jti: string;
  token_hash: string;
  user_id: string;
  token_family_id: string;
  replaced_by_id: string | null;
  expires_at: Date;
  revoked_at: Date | null;
  revoked_reason: RevokedReason | null;
  created_at: Date;
}


const mapRow = (row: RefreshTokenRow): RefreshToken => ({
  id: row.id,
  jti: row.jti,
  tokenHash: row.token_hash,
  userId: row.user_id,
  tokenFamilyId: row.token_family_id,
  replacedById: row.replaced_by_id,
  revokedAt: row.revoked_at,
  revokedReason: row.revoked_reason,
  expiresAt: row.expires_at,
  createdAt: row.created_at,
});

interface SaveRefreshTokenInput {
  jti: string;
  tokenHash: string;
  userId: string;
  tokenFamilyId: string;
  expiresAt: Date;
}

export const saveRefreshToken = async (
  input: SaveRefreshTokenInput,
  client?: PoolClient
): Promise<RefreshToken> => {
  const db = client || pool
  const result = await db.query(
    "INSERT INTO refresh_tokens(jti, token_hash, user_id, token_family_id, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [
      input.jti,
      input.tokenHash,
      input.userId,
      input.tokenFamilyId,
      input.expiresAt,
    ],
  );
  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to insert refresh token");
  }
  return mapRow(row);
};

export const findRefreshTokenByJti = async (
  jti: string,
  client?: PoolClient
): Promise<RefreshToken | null> => {
  const db = client || pool
  const result = await db.query<RefreshTokenRow>(
    `SELECT * FROM refresh_tokens WHERE jti = $1 FOR UPDATE`,
    [jti],
  );
  const row = result.rows[0];
  return row ? mapRow(row) : null;
};

export const markTokenReplaced = async (
  oldTokenId: string,
  client?: PoolClient
): Promise<void> => {
  const db = client || pool
  await db.query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`,
    [oldTokenId],
  );
};

export const linkReplacedToken = async (
  oldTokenId: string,
  newTokenId: string,
  client?: PoolClient
): Promise<void> => {
  const db = client || pool
  await db.query(
    `UPDATE refresh_tokens SET replaced_by_id = $2 WHERE id = $1`,
    [oldTokenId, newTokenId],
  );
};

export const revokeTokenFamily = async (
  tokenFamilyId: string, reason: string
): Promise<void> => {
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = now(), revoked_reason = $2
    WHERE token_family_id = $1 AND revoked_at IS NULL`,
    [tokenFamilyId, reason],
  );
};

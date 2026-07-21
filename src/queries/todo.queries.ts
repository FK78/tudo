import { pool } from "../db/db.ts";
import { SORT_COLUMNS, SORT_ORDERS, type TodoFilters, type TodoResponse } from "../types/todos.ts";

interface TodoRow {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: Date;
}

const mapTodoRow = (row: TodoRow): TodoResponse => ({
  id: row.id,
  title: row.title,
  description: row.description,
});

export const saveTodo = async (
  title: string,
  description: string,
  userId: string,
) => {
  const result = await pool.query(
    "INSERT INTO todos(title, description, user_id) VALUES ($1, $2, $3) RETURNING id, title, description",
    [title, description, userId],
  );
  const row = result.rows[0];
  return row ? mapTodoRow(row) : null;
};

export const updateTodo = async (
  title: string,
  description: string,
  userId: string,
  todoId: string,
) => {
  const result = await pool.query(
    "UPDATE todos SET title = $1, description = $2 WHERE user_id = $3 AND id = $4 RETURNING id, title, description",
    [title, description, userId, todoId],
  );
  const row = result.rows[0];
  return row ? mapTodoRow(row) : null;
};

export const getUserIdForTodoById = async (todoId: string) => {
  const result = await pool.query("SELECT user_id FROM todos WHERE id = $1", [
    todoId,
  ]);
  return result.rows[0]?.user_id;
};

export const deleteTodo = async (userId: string, todoId: string) => {
  await pool.query("DELETE FROM todos WHERE user_id = $1 AND id = $2", [
    userId,
    todoId,
  ]);
};

export const fetchTodos = async (
  userId: string,
  page: number,
  limit: number,
  { sort, order, title, description }: TodoFilters,
) => {
  const offset = (page - 1) * limit;

  let query = `SELECT id, title, description, COUNT(*) OVER() AS total FROM todos WHERE user_id = $1`
  const params: any[] = [userId]

  if (title) {
    params.push(`%${title}%`)
    query += ` AND title ILIKE $${params.length}`;
  }

  if (description) {
    params.push(`%${description}%`)
    query += ` AND description ILIKE $${params.length}`;
  }

  const sortColumn = SORT_COLUMNS[sort] ?? SORT_COLUMNS.created_at
  const sortOrder = SORT_ORDERS[order] ?? SORT_ORDERS.asc
  query += ` ORDER BY ${sortColumn} ${sortOrder}`

  params.push(limit);
  query += ` LIMIT $${params.length}`

  params.push(offset);
  query += ` OFFSET $${params.length}`

  const result = await pool.query(
    query, params
  );
  const total = result.rows[0]?.total ?? 0;
  const data = result.rows.map(({ total, ...row }) => row);
  return { data, total: parseInt(total) };
};

import type { Request, Response } from "express";
import {
  insertTodo,
  editTodo,
  removeTodo,
  getTodos,
} from "../services/todo.service.ts";
import { SORT_COLUMNS, SORT_ORDERS } from "../types/todos.ts";

export const createTodo = async (req: Request, res: Response) => {
  const result = await insertTodo(req.body, req.user!.id);
  res.status(201).json(result);
};

export const updateTodo = async (req: Request, res: Response) => {
  const noteId = req.params.id as string;
  const result = await editTodo(req.body, req.user!.id, noteId);
  res.status(200).json(result);
};

export const deleteTodo = async (req: Request, res: Response) => {
  const noteId = req.params.id as string;
  await removeTodo(req.user!.id, noteId);
  res.status(204).end();
};

export const retrieveTodos = async (req: Request, res: Response) => {
  const allowedSorts = Object.keys(SORT_COLUMNS)
  const sort = (allowedSorts.includes(req.query.sort as string)
    ? req.query.sort
    : "created_at") as "created_at" | "title";

  const allowedOrder = Object.keys(SORT_ORDERS)
  const order = (allowedOrder.includes(req.query.order as string)
    ? req.query.order
    : "asc") as "asc" | "desc";

  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit as string) || 1, 1),
    100,
  );
  const { data, total } = await getTodos(req.user!.id, page, limit, {
    sort,
    order,
    title: req.query.title as string | undefined,
    description: req.query.description as string | undefined,
  });

  res.status(200).json({ data: data, page: page, limit: limit, total: total });
};

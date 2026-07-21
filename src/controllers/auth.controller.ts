import type { Request, Response } from "express";
import { loginUser, refreshTokens, registerUser } from "../services/auth.service.ts";

export const register = async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await registerUser(req.body);
  return res.status(201).json({ accessToken, refreshToken });
};

export const login = async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await loginUser(req.body);
  return res.status(200).json({ accessToken, refreshToken });

};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await refreshTokens(refreshToken);
  return res.status(200).json(tokens);
};
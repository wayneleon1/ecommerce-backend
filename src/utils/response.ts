import { Response } from "express";
import { BaseResponse, PaginatedResponse } from "../types";

export const sendSuccess = <T>(
  res: Response,
  message: string,
  object?: T,
  statusCode: number = 200
): Response => {
  const response: BaseResponse<T> = {
    success: true,
    message,
    object,
    errors: null,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  errors?: string[] | null,
  statusCode: number = 400
): Response => {
  const response: BaseResponse = {
    success: false,
    message,
    errors: errors || null,
  };
  return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  message: string,
  data: T[],
  page: number,
  pageSize: number,
  total: number
): Response => {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    object: data,
    pageNumber: page,
    pageSize,
    totalSize: total,
    errors: null,
  };
  return res.status(200).json(response);
};

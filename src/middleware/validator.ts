import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { sendError } from "../utils/response";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const errors = error.errors?.map((e: any) => e.message) || [
        "Validation failed",
      ];
      return sendError(res, "Validation failed", errors, 400);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        pageSize: req.query.pageSize
          ? parseInt(req.query.pageSize as string)
          : 10,
        search: req.query.search as string,
      };
      req.query = schema.parse(query) as any;
      next();
    } catch (error: any) {
      const errors = error.errors?.map((e: any) => e.message) || [
        "Validation failed",
      ];
      return sendError(res, "Validation failed", errors, 400);
    }
  };
};

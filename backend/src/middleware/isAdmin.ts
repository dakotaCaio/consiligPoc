import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const companyIdFromParams = Number(req.params.companyId); 
  if (req.user.companyId !== 1 && req.user.companyId !== companyIdFromParams) {
    throw new AppError("Access denied. Only users from the same company as the admin can access this route", 403);
  }
  return next();
};

export default isAdmin;

import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import User from "../models/User";

const isSuper = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  if (req.user.profile !== 'admin') {
    return next(new AppError("Acesso não permitido", 403)); 
  }

  const user = await User.findByPk(req.user.id);

  if (!user?.super) {
    return next(new AppError("Acesso não permitido", 403)); 
  }
  return next(); 
};

const isSuperbp = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  if (req.user.profile !== 'admin') {
    return next(new AppError("Acesso não permitido", 403)); 
  }
  
  const user = await User.findByPk(req.user.id);
  
  if (!user?.superbp) {
    return next(new AppError("Acesso não permitido", 403)); 
  }
  return next(); 
};

const isSuperOrSuperbp = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  if (req.user.profile !== 'admin') {
    return next(new AppError("Acesso não permitido", 403));
  }

  const user = await User.findByPk(req.user.id);

  if (user?.super || user?.superbp) {
    return next(); 
  }

  return next(new AppError("Acesso não permitido", 403)); 
};

const isAdminOrSuperbp = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  // Verificando se o usuário é admin ou superbp
  if (req.user.profile === 'admin' || req.user.profile === 'superbp') {
    return next(); // Deixa passar sem verificar companyId, acesso total
  }


  if (req.user.companyId !== Number(req.params.companyId)) {
    return next(new AppError("Access denied. You do not have permission for this company's data.", 403));
  }

  return next();
};


export { isSuper, isSuperbp, isSuperOrSuperbp, isAdminOrSuperbp };

import type { NextFunction, Request, Response } from "express";

/** Enrobe un handler async pour transmettre les erreurs au middleware Express. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

import { checkinClientService } from "@src/services/checkinService";
import { Request, Response, NextFunction } from "express";

export const checkIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const citaId = Number(req.params.id);
    const { clientRecord, cita } = await checkinClientService(citaId, req.body);
    res.status(200).json({ clientRecord, cita });
  } catch (error) {
    next(error);
  }
};

import {
  createGarantiaService,
  deleteGarantiaService,
  getGarantiaIdService,
  getGarantiasService,
  updateGarantiaService,
} from "@src/services/garantiaService";
import { Request, Response } from "express";

// Obtener todas las Garantias
export const getGarantias = async (
  req: Request,
  res: Response
): Promise<void> => {
  const garantias = await getGarantiasService();
  res.json(garantias);
};

//Obtener garantia por su ID
export const getGarantiaId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id);
  const garantia = await getGarantiaIdService(id);
  res.json(garantia);
};

//Crear una garantia
export const pushGarantia = async (
  req: Request,
  res: Response
): Promise<void> => {
  const citaId = Number(req.params.citaId);
  const clienteId = Number(req.params.clienteId);
  const newGarantia = await createGarantiaService(req.body, citaId, clienteId);
  res.status(201).json(newGarantia);
};

//Modificar una garantia por su id
export const putGarantia = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const data = req.body;
  const updatedGarantia = await updateGarantiaService(Number(id), data);
  res.status(200).json(updatedGarantia);
};

// Eliminar garantia por su Id
export const deleteGarantia = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const deletedGarantia = await deleteGarantiaService(Number(id));
  res.status(200).json(deletedGarantia);
};

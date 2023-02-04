import { notFoundError } from '@/errors';
import { AuthenticatedRequest } from '@/middlewares';
import { hotelsService } from '@/services/hotels-service';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

export async function listAllHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const hotels = await hotelsService.getAllHotels(userId);
    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    console.log(error);
    if (error.name === 'UnauthorizedError') {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function listHotelById(req: Request, res: Response) {
  const id = Number(req.params);
  try {
    if (!id) {
      throw notFoundError();
    }
    const hotel = await hotelsService.getHotelById(id);

    return res.status(httpStatus.OK).send(hotel);
  } catch (error) {
    console.log(error);
    if (error.name === 'UnauthorizedError') {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

import { listAllHotels, listHotelById } from '@/controllers/hotels-controller';
import { authenticateToken } from '@/middlewares';
import { Router } from 'express';

const hotelsRouter = Router();

hotelsRouter.all('/*', authenticateToken).get('/', listAllHotels).get('/:hotelId', listHotelById);

export { hotelsRouter };

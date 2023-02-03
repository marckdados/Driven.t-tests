import { notFoundError } from '@/errors';
import { hotelsRepository } from '@/repositories/hotels-repository';

async function getAllHotels() {
  const response = await hotelsRepository.getAllHotels();
  return response;
}

async function getHotelById(id: number) {
  const response = await hotelsRepository.getHotelById(id);
  if (!response) {
    throw notFoundError();
  }
  return response;
}

export const hotelsService = {
  getAllHotels,
  getHotelById,
};

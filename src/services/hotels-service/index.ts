import { notFoundError } from '@/errors';
import { paymentRequired } from '@/errors/payment-required';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { hotelsRepository } from '@/repositories/hotels-repository';
import ticketRepository from '@/repositories/ticket-repository';

async function getAllHotels(userId: number) {
  const enrollmentExists = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollmentExists) {
    throw notFoundError();
  }

  const ticketExists = await ticketRepository.findTicketByEnrollmentId(enrollmentExists.id);

  if (!ticketExists) {
    throw notFoundError();
  }

  const hotelExists = await hotelsRepository.getAllHotels();
  if (hotelExists.length === 0) {
    throw notFoundError();
  }
  if (ticketExists.status !== 'PAID' || ticketExists.TicketType.isRemote || !ticketExists.TicketType.includesHotel) {
    throw paymentRequired();
  }

  const response = await hotelsRepository.getAllHotels();
  return response;
}

async function getHotelById(id: number, userId: number) {
  const enrollmentExists = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollmentExists) {
    throw notFoundError();
  }

  const ticketExists = await ticketRepository.findTicketByEnrollmentId(enrollmentExists.id);

  if (!ticketExists) {
    throw notFoundError();
  }

  const hotelExists = await hotelsRepository.getAllHotels();

  if (!hotelExists) {
    throw notFoundError();
  }
  if (ticketExists.status !== 'PAID' || ticketExists.TicketType.isRemote || !ticketExists.TicketType.includesHotel) {
    throw paymentRequired();
  }

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

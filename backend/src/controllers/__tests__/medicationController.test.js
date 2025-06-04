import { request } from "supertest"
import express from "express"
const medicationController = require('../controllers/medicationController');

const app = express();
app.use(express.json());

jest.mock('../models/medicationModel', () => ({
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
}));

const { findById } = require('../models/medicationModel');

describe('Medication Controller', () => {
  describe('getMedicationById', () => {
    it('should throw error if medication not found', async () => {
      findById.mockResolvedValue(null);
      const req = { params: { id: 'fake' }, user: { _id: 'user1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await expect(medicationController.getMedicationById(req, res)).rejects.toThrow('Medication not found');
    });
  });
});
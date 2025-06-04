import { request } from "supertest"
import express from "express"
const adherenceController = require('../controllers/adherenceController');

jest.mock('../models/adherenceModel', () => ({
  findAdherenceById: jest.fn(),
  findAdherenceByDate: jest.fn(),
  updateAdherenceRecord: jest.fn(),
  aggregateAdherenceStats: jest.fn(),
  createAdherenceRecord: jest.fn(),
}));

const { findAdherenceById } = require('../models/adherenceModel');

describe('Adherence Controller', () => {
  describe('confirmMedicationTaken', () => {
    it('should throw error if adherence record not found', async () => {
      findAdherenceById.mockResolvedValue(null);
      const req = { body: { adherenceId: 'fake', medicationId: null }, user: { id: 'user1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await expect(adherenceController.confirmMedicationTaken(req, res)).rejects.toThrow('Adherence record not found');
    });
  });
});
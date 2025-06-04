import { request } from "supertest"
import express from "express"
const reminderController = require('../controllers/reminderController');

jest.mock('../models/reminderModel', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

const { find } = require('../models/reminderModel');

describe('Reminder Controller', () => {
  describe('getAllReminders', () => {
    it('should return empty array if no reminders', async () => {
      find.mockResolvedValue([]);
      const req = { user: { _id: 'user1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await reminderController.getAllReminders(req, res);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
});
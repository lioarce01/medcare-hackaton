import { request } from "supertest"
import express from "express"
const userController = require('../controllers/userController');

// Mock Express app and middleware
const app = express();
app.use(express.json());
app.get('/api/users/profile', (req, res) => userController.getUserProfile(req, res));

// Mock req/res for controller unit test
const mockReq = (user = {}) => ({ user });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('User Controller', () => {
  describe('getUserProfile', () => {
    it('should return 404 if user not found', async () => {
      const req = mockReq({ id: 'notfound' });
      const res = mockRes();
      // Mock supabaseAdmin
      userController.__setMockSupabaseAdmin({ error: true });
      await expect(userController.getUserProfile(req, res)).rejects.toThrow('User not found');
    });
  });
});

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../utils/db';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token-key-change-in-production';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const existingUser = await dbService.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await dbService.user.create({
        data: {
          email,
          passwordHash,
          subscriptionStatus: 'PRO' // Defaulting newly registered users to PRO plan for demo ease
        }
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, subscriptionStatus: user.subscriptionStatus },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Registration failed.' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const user = await dbService.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, subscriptionStatus: user.subscriptionStatus },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Login failed.' });
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthenticated.' });
      }

      const user = await dbService.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        return res.status(404).json({ message: 'User profile not found.' });
      }

      res.json({
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Profile fetch failed.' });
    }
  }

  static async updateSubscription(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthenticated.' });
      }

      const { plan } = req.body; // FREE, PRO, ENTERPRISE
      if (!['FREE', 'PRO', 'ENTERPRISE'].includes(plan)) {
        return res.status(400).json({ message: 'Invalid subscription plan level.' });
      }

      const updatedUser = await dbService.user.update({
        where: { id: req.user.id },
        data: { subscriptionStatus: plan }
      });

      res.json({
        message: `Subscription successfully upgraded to ${plan}`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          subscriptionStatus: updatedUser.subscriptionStatus
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Subscription upgrade failed.' });
    }
  }
}

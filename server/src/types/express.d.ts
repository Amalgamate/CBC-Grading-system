import { Role } from '../config/permissions';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: Role;
        schoolId?: string | null;
        branchId?: string | null;
      };
    }
  }
}

export {};

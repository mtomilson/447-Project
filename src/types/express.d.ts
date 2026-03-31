export {};

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      user_id: string;
      name: string;
      email: string;
      role: string | null;
      created_at: string;
      is_active: boolean;
    };
  }
}
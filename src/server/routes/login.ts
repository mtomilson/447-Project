import { Router } from "express";
import {authenticateUser, getUserProfile} from "../../lib/helper"

const router = Router();

/**
 * login route
 * params: email: string, password: string
 * returns: user: JSON Object, token: string
 */

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const authData = await authenticateUser(email, password); // returns data about authenticated user, includes session token and uuid
    const profile = await getUserProfile(authData.user.id); // returns profile data for authenticated user, includes user_id and role

    return res.json({
      user: profile,
      token: authData.session?.access_token, // session token, can be used for subsequent authenticated requests
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
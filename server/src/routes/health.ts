import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Mjolnir Gym Tracker',
    timestamp: new Date().toISOString(),
  });
});

export default router;

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { runAutonomousTravelPlanner } from './src/services/agentRunner.ts';
import { search_flights, search_hotels, get_weather_forecast } from './src/services/travelEngine.ts';
import { AIRPORTS } from './src/data/airports.ts';
import { PRESET_SCENARIOS } from './src/data/presets.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // API Route: Autonomous Travel Planning Agent
  app.post('/api/agent/plan', async (req, res) => {
    try {
      const { origin, destination, departureDate, returnDate, totalBudget } = req.body;

      if (!origin || !destination || !departureDate || !returnDate || totalBudget === undefined) {
        return res.status(400).json({
          status: 'error',
          error_message: 'Missing required parameters: origin, destination, departureDate, returnDate, totalBudget',
          financials: { total_budget: Number(totalBudget) || 0, total_spent: 0, remaining_funds: 0 }
        });
      }

      const result = await runAutonomousTravelPlanner({
        origin: String(origin),
        destination: String(destination),
        departureDate: String(departureDate),
        returnDate: String(returnDate),
        totalBudget: Number(totalBudget),
      });

      return res.json(result);
    } catch (error: any) {
      console.error('Agent execution error:', error);
      return res.status(500).json({
        output: {
          status: 'error',
          error_message: error?.message || 'Internal error in autonomous agent execution.',
          financials: { total_budget: Number(req.body.totalBudget) || 0, total_spent: 0, remaining_funds: 0 }
        },
        traces: [],
        executionTimeMs: 0
      });
    }
  });

  // Direct Tool Playground API: search_flights
  app.post('/api/tools/search_flights', (req, res) => {
    try {
      const { origin, destination, departure_date, return_date } = req.body;
      if (!origin || !destination || !departure_date || !return_date) {
        return res.status(400).json({ error: 'Missing flight search parameters' });
      }
      const data = search_flights({ origin, destination, departure_date, return_date });
      return res.json(data);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Direct Tool Playground API: search_hotels
  app.post('/api/tools/search_hotels', (req, res) => {
    try {
      const { city, check_in, check_out, max_price_per_night } = req.body;
      if (!city || !check_in || !check_out || max_price_per_night === undefined) {
        return res.status(400).json({ error: 'Missing hotel search parameters' });
      }
      const data = search_hotels({
        city,
        check_in,
        check_out,
        max_price_per_night: Number(max_price_per_night),
      });
      return res.json(data);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Direct Tool Playground API: get_weather_forecast
  app.post('/api/tools/get_weather_forecast', (req, res) => {
    try {
      const { city, start_date, end_date } = req.body;
      if (!city || !start_date || !end_date) {
        return res.status(400).json({ error: 'Missing weather forecast parameters' });
      }
      const data = get_weather_forecast({
        city,
        start_date,
        end_date,
      });
      return res.json(data);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Data helpers
  app.get('/api/airports', (_req, res) => {
    res.json(AIRPORTS);
  });

  app.get('/api/presets', (_req, res) => {
    res.json(PRESET_SCENARIOS);
  });

  // Development vs Production static serving
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Autonomous Travel Planner running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

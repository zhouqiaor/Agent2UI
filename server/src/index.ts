import express from "express";
import cors from "cors";
import { meetingsRouter } from "./routes/meetings.js";
import { a2uiRouter } from "./routes/a2ui.js";
import { assistantRouter } from "./routes/assistant.js";

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/v1/meetings', meetingsRouter);
app.use('/api/v1/a2ui', a2uiRouter);
app.use('/api/v1/assistant', assistantRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});

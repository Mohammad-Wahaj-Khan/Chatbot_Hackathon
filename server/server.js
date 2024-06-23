import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'server.log' })
    ]
});

if (!process.env.OPENAI_API_KEY) {
    logger.error('OPENAI_API_KEY is not defined in environment variables');
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    optionSuccessStatus: 200
  };
  
  app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  
  // Define routes
  app.get('/', (req, res) => {
    res.status(200).send({
      message: 'Hello from Codex',
    });
  });
  
  app.post('/', async (req, res) => {
    try {
      const prompt = req.body.prompt;
  
      if (!prompt) {
        return res.status(400).send({ error: 'Prompt is required' });
      }
  
      // const response = await openai.chat.completions.create({
      //   model: "gpt-3.5-turbo-16k",
      //   prompt: `${prompt}`,
      //   temperature: 1,
      //   max_tokens: 256,
      //   top_p: 1,
      //   frequency_penalty: 0.5,
      //   presence_penalty: 0,
      // });

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // or "gpt-4"
        messages: [
            { role: "user", content: `${prompt}` }
        ],
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0,
    });
    

      // const response = await openai.createTextCompletion({
      //   model: "text-davinci-003",
      //   prompt: `${prompt}`,
      //   temperature: 0,
      //   max_tokens: 2048,
      //   top_p: 1,
      //   frequency_penalty: 0.5,
      //   presence_penalty: 0,
      // });
  
      res.status(200).send({
        bot: response.data.choices[0].text
      });
    } catch (err) {
      logger.error('Error in / route', err);
      if (err.name === 'OpenAIApiError') {
        res.status(500).send({
          error: 'An error occurred while processing your request. Please check your API key and the request parameters.'
        });
      } else {
        res.status(500).send({
          error: err.message
        });
      }
    }
  });
  
  app.listen(5000, () => logger.info('Server listening on port http://localhost:5000'));
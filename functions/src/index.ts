import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import axios from "axios";

const app = express();
app.use(cors({origin: true}));

const API_BASE_URL = "https://api.coingecko.com/api/v3";

app.get("/coins/markets", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/coins/markets`, { params: req.query });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching /coins/markets:", error);
    res.status(500).send("Failed to fetch market data from CoinGecko.");
  }
});

app.get("/coins/:coinId", async (req, res) => {
  try {
    const { coinId } = req.params;
    const response = await axios.get(`${API_BASE_URL}/coins/${coinId}`, { params: req.query });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(`Error fetching /coins/${req.params.coinId}:`, error);
    res.status(500).send("Failed to fetch coin details from CoinGecko.");
  }
});

app.get("/coins/:coinId/ohlc", async (req, res) => {
  try {
    const { coinId } = req.params;
    const response = await axios.get(`${API_BASE_URL}/coins/${coinId}/ohlc`, { params: req.query });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(`Error fetching /coins/${req.params.coinId}/ohlc:`, error);
    res.status(500).send("Failed to fetch chart data from CoinGecko.");
  }
});

export const api = functions.https.onRequest(app);
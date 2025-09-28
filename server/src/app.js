const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const HIGHLEVEL_BASE_URL = process.env.HIGHLEVEL_BASE_URL || 'https://services.leadconnectorhq.com';
const HIGHLEVEL_API_VERSION = process.env.HIGHLEVEL_API_VERSION || '2021-07-28';
const HIGHLEVEL_ACCESS_TOKEN = process.env.HIGHLEVEL_ACCESS_TOKEN;
const HIGHLEVEL_AGENCY_ID = process.env.HIGHLEVEL_AGENCY_ID;

if (!HIGHLEVEL_ACCESS_TOKEN) {
  console.warn('HIGHLEVEL_ACCESS_TOKEN is not set. API requests will fail until it is configured.');
}

const highLevelClient = axios.create({
  baseURL: HIGHLEVEL_BASE_URL,
  headers: {
    Accept: 'application/json',
    Version: HIGHLEVEL_API_VERSION,
    Authorization: HIGHLEVEL_ACCESS_TOKEN ? `Bearer ${HIGHLEVEL_ACCESS_TOKEN}` : undefined,
  },
});

const buildSearchParams = (query) => {
  const params = new URLSearchParams();
  if (query.skip !== undefined) params.set('skip', query.skip);
  if (query.limit !== undefined) params.set('limit', query.limit);
  if (query.email) params.set('email', query.email);
  if (HIGHLEVEL_AGENCY_ID) params.set('companyId', HIGHLEVEL_AGENCY_ID);
  if (query.order) params.set('order', query.order);
  return params;
};

const fetchLocationsPage = async (query) => {
  const params = buildSearchParams(query);
  const { data } = await highLevelClient.get('/locations/locations/search', { params });
  return data;
};

app.get('/api/locations', async (req, res) => {
  const { skip = 0, limit = 50, email, order, all } = req.query;
  const cacheKey = `locations:${skip}:${limit}:${email || ''}:${order || ''}:${all || 'false'}`;

  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  try {
    if (all === 'true') {
      let results = [];
      let currentSkip = Number(skip) || 0;
      const pageSize = Number(limit) || 50;
      while (true) {
        const page = await fetchLocationsPage({ skip: currentSkip, limit: pageSize, email, order });
        const locations = page?.locations || [];
        results = results.concat(locations);
        if (!page || !locations.length || locations.length < pageSize) {
          break;
        }
        currentSkip += pageSize;
      }
      cache.set(cacheKey, { locations: results });
      return res.json({ locations: results });
    }

    const page = await fetchLocationsPage({ skip, limit, email, order });
    cache.set(cacheKey, page);
    res.json(page);
  } catch (error) {
    console.error('Error fetching locations', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: 'Unable to fetch locations',
      details: error.response?.data || error.message,
    });
  }
});

app.get('/api/locations/:locationId', async (req, res) => {
  const { locationId } = req.params;
  const cacheKey = `location:${locationId}`;

  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  try {
    const { data } = await highLevelClient.get(`/locations/locations/${locationId}`);
    cache.set(cacheKey, data, 120);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching location ${locationId}`, error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: 'Unable to fetch location',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = app;

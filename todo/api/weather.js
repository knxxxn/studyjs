export default async function handler(req, res) {
  const { type, nx, ny, base_date, base_time, pageNo, numOfRows } = req.query;
  const serviceKey = process.env.KMA_API_KEY;

  // Set CORS headers if needed for local testing outside Vercel, though Vercel handles it normally.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!serviceKey) {
    return res.status(500).json({ error: 'KMA_API_KEY is not configured in environment variables' });
  }

  let url = '';
  if (type === 'ultra') {
    url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}`;
  } else if (type === 'vilage') {
    url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}`;
  } else {
    return res.status(400).json({ error: 'Invalid type parameter.' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Weather API Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to fetch weather data from KMA API' });
  }
}

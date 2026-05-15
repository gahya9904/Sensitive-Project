require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err.message);
  }
}

// API Endpoint: Analyze Sentiment
// Vercel에서 api/index.js로 요청이 오면 /api/analyze로 매칭되도록 설정
app.post('/api/analyze', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: '텍스트를 입력해주세요.' });
  }

  if (text.length > 1000) {
    return res.status(400).json({ error: '텍스트는 1000자 이내로 입력해주세요.' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "너는 한국어 텍스트 감성 분석기다. 결과를 반드시 JSON 형식으로 응답하라. 사용자 텍스트를 positive, negative, neutral 중 하나로 분류한다. confidence는 0부터 100 사이의 정수로 작성한다. reason은 한국어로 한 문장만 작성한다. 과장하지 말고 텍스트 근거만 사용한다."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    const normalizedResult = {
      sentiment: result.sentiment || 'neutral',
      confidence: result.confidence || 0,
      reason: result.reason || '분석 결과를 생성할 수 없습니다.'
    };

    if (supabase) {
      await supabase.from('sentiment_logs').insert([{
        input_text: text,
        sentiment: normalizedResult.sentiment,
        confidence: normalizedResult.confidence,
        reason: normalizedResult.reason
      }]);
    }

    res.json(normalizedResult);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: '분석 중 문제가 발생했습니다.' });
  }
});

module.exports = app;

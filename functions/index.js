const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyDAL3j4q-gyDeHvwTultg3r_yTGJllcG9c'; // Gemini API 키를 여기에 입력하세요
const genAI = new GoogleGenerativeAI(API_KEY);

exports.analyzeStory = functions.https.onRequest(async (request, response) => {
    // CORS 헤더 설정
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST');
    response.set('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS 요청 처리 (CORS 프리플라이트)
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }

    if (request.method !== 'POST') {
        response.status(405).send('Method Not Allowed');
        return;
    }

    const { story, language } = request.body.data;

    if (!story || !language) {
        response.status(400).send('Missing required fields: story or language');
        return;
    }

    try {
        const prompt = language === 'ko' 
            ? `다음 이야기를 분석하고 F. Scott Fitzgerald의 "위대한 개츠비" 스타일로 다시 작성하세요. 작가의 감정과 느낌에 초점을 맞추세요. 이야기: "${story}"`
            : `Analyze the following story and rewrite it in the style of F. Scott Fitzgerald's "The Great Gatsby", focusing on the emotions and feelings of the author. The story: "${story}"`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const generatedText = result.response.text();

        response.json({ result: { analysis: generatedText } });
    } catch (error) {
        console.error('Error in analyzeStory function:', error);
        response.status(500).json({ error: 'An error occurred while analyzing the story' });
    }
});
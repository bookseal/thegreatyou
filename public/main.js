// Cloud Function URL
const FUNCTION_URL = 'https://us-central1-thegreatyou-4f0c7.cloudfunctions.net/analyzeStory';

// DOM 요소 선택
const form = document.getElementById('story-form');
const resultDiv = document.getElementById('result');
const gatsbyAnalysis = document.getElementById('gatsby-analysis');
const popup = document.getElementById('popup');
const closePopup = document.getElementById('close-popup');
const usernameInput = document.getElementById('username-input');
const usernameSpan = document.getElementById('username');
const submitButton = form.querySelector('button[type="submit"]');
const storyInput = document.getElementById('story');

// 언어 감지 함수
function detectLanguage(text) {
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return koreanRegex.test(text) ? 'ko' : 'en';
}

// UI 업데이트 함수
function updateUI(isLoading, language) {
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading
        ? (language === 'ko' ? '분석 중...' : 'Analyzing...')
        : (language === 'ko' ? '개츠비 스타일로 분석' : 'Analyze in Gatsby Style');
    submitButton.classList.toggle('opacity-50', isLoading);
    submitButton.classList.toggle('cursor-not-allowed', isLoading);
}

// 에러 표시 함수
function showError(message, language) {
    gatsbyAnalysis.textContent = language === 'ko'
        ? `오류: ${message}`
        : `Error: ${message}`;
    resultDiv.classList.remove('hidden');
}

// 분석 결과 표시 함수
function showAnalysis(analysis, username) {
    gatsbyAnalysis.textContent = analysis;
    resultDiv.classList.remove('hidden');
    popup.classList.remove('hidden');
    usernameSpan.textContent = username || 'You';
}

// Cloud Function 호출 함수
async function callAnalyzeFunction(story, language) {
    const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { story, language } })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response.json();
}

// 폼 제출 이벤트 리스너
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const story = storyInput.value.trim();
    const username = usernameInput.value.trim();
    const language = detectLanguage(story);

    if (!story) {
        showError(language === 'ko' ? '이야기를 입력해주세요.' : 'Please enter a story.', language);
        return;
    }

    updateUI(true, language);

    try {
        const data = await callAnalyzeFunction(story, language);
        if (data && data.result && data.result.analysis) {
            showAnalysis(data.result.analysis, username);
        } else {
            throw new Error(language === 'ko' ? '분석 결과를 받지 못했습니다' : 'No analysis result received');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(error.message, language);
    } finally {
        updateUI(false, language);
    }
});

// 팝업 닫기 이벤트 리스너
closePopup.addEventListener('click', () => {
    popup.classList.add('hidden');
});

// 사용자 이름 입력 이벤트 리스너
usernameInput.addEventListener('input', (e) => {
    usernameSpan.textContent = e.target.value.trim() || 'You';
});

// 초기 UI 설정
updateUI(false, 'en');
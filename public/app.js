document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const charCount = document.getElementById('char-count');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loadingBox = document.getElementById('loading-box');
    const errorBox = document.getElementById('error-box');
    const errorMessage = document.getElementById('error-message');
    const resultCard = document.getElementById('result-card');
    const sentimentDisplay = document.getElementById('sentiment-display');
    const confidenceBar = document.getElementById('confidence-bar');
    const confidenceText = document.getElementById('confidence-text');
    const reasonText = document.getElementById('reason-text');
    const resetBtn = document.getElementById('reset-btn');

    const sentimentMap = {
        'positive': '긍정',
        'negative': '부정',
        'neutral': '중립'
    };

    // Update character count
    textInput.addEventListener('input', () => {
        const length = textInput.value.length;
        charCount.textContent = `${length} / 1000`;
    });

    // Analyze button click
    analyzeBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();

        if (!text) {
            showError('분석할 문장을 입력해 주세요.');
            return;
        }

        startLoading();

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '분석 중 오류가 발생했습니다.');
            }

            showResult(data);
        } catch (error) {
            showError(error.message);
        } finally {
            stopLoading();
        }
    });

    // Reset button click
    resetBtn.addEventListener('click', () => {
        textInput.value = '';
        charCount.textContent = '0 / 1000';
        resultCard.classList.add('hidden');
        textInput.focus();
    });

    function startLoading() {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = '분석 중...';
        loadingBox.classList.remove('hidden');
        errorBox.classList.add('hidden');
        resultCard.classList.add('hidden');
    }

    function stopLoading() {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '분석 하기';
        loadingBox.classList.add('hidden');
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorBox.classList.remove('hidden');
        resultCard.classList.add('hidden');
    }

    function showResult(data) {
        sentimentDisplay.textContent = sentimentMap[data.sentiment] || '중립';
        
        // Add color based on sentiment
        sentimentDisplay.style.color = data.sentiment === 'positive' ? '#4caf50' : 
                                      data.sentiment === 'negative' ? '#ff6b6b' : '#fff176';
        
        confidenceBar.style.width = `${data.confidence}%`;
        confidenceText.textContent = `${data.confidence}%`;
        reasonText.textContent = data.reason;
        
        resultCard.classList.remove('hidden');
        resultCard.scrollIntoView({ behavior: 'smooth' });
    }
});

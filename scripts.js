// دالة لتبديل ظهور القائمة عند النقر على الزر
document.getElementById('menu-btn').addEventListener('click', function() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('show');
});

// دالة لحل المسألة الرياضية باستخدام مكتبات مختلفة
async function solveMath() {
    const input = document.getElementById('math-input').value;
    let solution = '';

    // تحويل النصوص العربية إلى صيغة رياضية مفهومة
    const formattedInput = convertArabicMathExpression(input);

    // تحديد نوع المسألة الرياضية وتحليلها
    const problemType = analyzeMathInput(formattedInput);

    try {
        switch (problemType) {
            case 'general':
                solution = math.evaluate(formattedInput);
                break;
            case 'algebra':
                solution = nerdamer(formattedInput).text();
                break;
            case 'calculus':
                solution = Algebrite.run(formattedInput);
                break;
            case 'numeric':
                solution = numeric.solve(formattedInput);
                break;
            case 'statistics':
                solution = jStat(formattedInput).toString();
                break;
            case 'complex':
                solution = math.complex(formattedInput).toString();
                break;
            case 'polynomial':
                solution = math.polynomial(formattedInput).toString();
                break;
            case 'permutations':
                const [n, k] = formattedInput.split(',').map(Number);
                solution = permutations(n, k);
                break;
            case 'sympy':
                // لم نعد نستخدم مكتبة SymPy
                break;
            default:
                solution = 'نوع المسألة غير معروف.';
        }

        // إذا لم يتم العثور على حل باستخدام المكتبات، استخدم الذكاء الاصطناعي
        if (!solution || solution === 'نوع المسألة غير معروف.') {
            solution = await getAIResponse(formattedInput);
        }
    } catch (error) {
        solution = 'خطأ في الحل: ' + error.message;
    }

    document.getElementById('solution').innerText = 'الحل: ' + solution;
    addToHistory(formattedInput, solution);
}

// دالة لتحويل النصوص العربية إلى صيغة رياضية مفهومة
function convertArabicMathExpression(input) {
    return input
        .replace(/س/g, 'x')
        .replace(/π/g, 'pi')
        .replace(/√/g, 'sqrt')
        .replace(/العدد المركب/g, 'complex number')
        .replace(/عدد مركب/g, 'complex number')
        .replace(/تباديل/g, 'permutations');
}

// دالة لتحليل النص وتحديد نوع المسألة
function analyzeMathInput(input) {
    input = input.toLowerCase();
    if (input.includes('تكامل') || input.includes('تفاضل')) {
        return 'calculus';
    } else if (input.includes('جبر')) {
        return 'algebra';
    } else if (input.includes('إحصاء')) {
        return 'statistics';
    } else if (input.includes('عدد مركب')) {
        return 'complex';
    } else if (input.includes('كثير الحدود')) {
        return 'polynomial';
    } else if (input.includes('تباديل') || input.includes('طرق تكوين')) {
        return 'permutations';
    } else if (input.includes('معادلة') || input.includes('حل')) {
        return 'sympy';
    } else {
        return 'general';
    }
}

// دالة لحساب التباديل
function permutations(n, k) {
    if (isNaN(n) || isNaN(k) || k < 0 || n < 0) {
        return 'المدخلات غير صحيحة';
    }
    return numeric.factorial(n) / numeric.factorial(n - k);
}

// دالة لإضافة السؤال والحل إلى السجل
function addToHistory(question, solution) {
    const historyContent = document.getElementById('history-content');
    const entry = document.createElement('div');
    entry.classList.add('history-entry');
    entry.innerHTML = `<p>السؤال: ${question}</p><p>الحل: ${solution}</p>`;
    historyContent.appendChild(entry);
}

// دالة لمسح الصفحة أو إعادة تعيين المحتوى عند الضغط على "السؤال التالي"
function nextQuestion() {
    document.getElementById('math-input').value = '';
    document.getElementById('solution').innerText = '';
    document.getElementById('image-result').innerText = '';
}

// دالة لتحليل الصورة واستخراج النص باستخدام مكتبة Tesseract.js
function analyzeImage() {
    const input = document.getElementById('image-upload');
    const result = document.getElementById('image-result');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            Tesseract.recognize(
                e.target.result,
                'ara',
                {
                    logger: (m) => console.log(m),
                }
            ).then(({ data: { text } }) => {
                result.innerText = 'النص المستخرج: ' + text;
                document.getElementById('math-input').value = text;
                solveMath();
            }).catch(error => {
                result.innerText = 'خطأ في تحليل الصورة: ' + error.message;
            });
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        result.innerText = 'يرجى تحميل صورة أولاً.';
    }
}

// دالة لفتح الكاميرا
function openCamera() {
    const video = document.getElementById('video');
    const captureButton = document.getElementById('capture');
    video.classList.remove('hidden');
    captureButton.classList.remove('hidden');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error('Error accessing the camera:', error);
        });
}

// دالة لالتقاط الصورة من الكاميرا
document.getElementById('capture').addEventListener('click', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());

    video.classList.add('hidden');
    this.classList.add('hidden');

    analyzeCapturedImage();
});

// دالة لتحليل الصورة الملتقطة
function analyzeCapturedImage() {
    const canvas = document.getElementById('canvas');
    const result = document.getElementById('image-result');

    canvas.toBlob(blob => {
        Tesseract.recognize(
            blob,
            'ara',
            {
                logger: (m) => console.log(m),
            }
        ).then(({ data: { text } }) => {
            result.innerText = 'النص المستخرج: ' + text;
            document.getElementById('math-input').value = text;
            solveMath();
        }).catch(error => {
            result.innerText = 'خطأ في تحليل الصورة: ' + error.message;
        });
    });
}

// دالة لفتح صفحة السجل
function openHistoryPage() {
    document.getElementById('history-page').classList.remove('hidden');
    document.getElementById('main-container').classList.add('hidden');
}

// دالة لإغلاق صفحة السجل
function closeHistoryPage() {
    document.getElementById('history-page').classList.add('hidden');
    document.getElementById('main-container').classList.remove('hidden');
}

// دالة لفتح صفحة المساعدة
function openHelpPage() {
    document.getElementById('help-page').classList.remove('hidden');
    document.getElementById('main-container').classList.add('hidden');
}

// دالة لإغلاق صفحة المساعدة
function closeHelpPage() {
    document.getElementById('help-page').classList.add('hidden');
    document.getElementById('main-container').classList.remove('hidden');
}

// دالة للحصول على إجابة ذكية من الذكاء الاصطناعي
async function getAIResponse(query) {
    try {
        const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
            },
            body: JSON.stringify({
                prompt: query,
                max_tokens: 150,
                temperature: 0.7
            })
        });
        const data = await response.json();
        return data.choices[0].text.trim();
    } catch (error) {
        return 'خطأ في الاتصال بالذكاء الاصطناعي: ' + error.message;
    }
}

// إعدادات التمهيد الأولي للتطبيق
document.addEventListener("DOMContentLoaded", function() {
    const splashScreen = document.getElementById('splash-screen');
    const mainContainer = document.getElementById('main-container');
    const imageUpload = document.getElementById('image-upload');

    setTimeout(() => {
        splashScreen.classList.add('hidden');
        mainContainer.classList.remove('hidden');
    }, 1800);

    imageUpload.addEventListener('change', analyzeImage);
    
    const historyContent = document.getElementById('history-content');
    historyContent.innerHTML = '<h2>سجل الحلول:</h2>';
});

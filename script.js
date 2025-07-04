
// 질문 항목 로딩
const questionList = [
    { id: "mood", question: "오늘 기분은 어떤가요?", options: ["상쾌함", "무기력함", "짜증남", "피곤함", "스트레스받는"] },
    { id: "hunger", question: "현재 배고픔 정도는?", options: ["아주 배고픔", "적당히 배고픔", "조금 배고픔", "별로 안 배고픔", "입맛 없음"] },
    { id: "condition", question: "몸 상태는 어떤가요?", options: ["정상", "감기기운", "숙취", "소화불량", "피로"] },
    { id: "companion", question: "혼밥인가요?", options: ["혼자", "가족과", "친구와", "연인과"] },
    { id: "budget", question: "예산은 얼마인가요?", options: ["만원 이하", "1-2만원", "2-3만원", "3만원 이상"] },
    { id: "foodType", question: "선호하는 음식 종류는?", options: ["밥", "면", "국물", "샐러드"] },
    { id: "taste", question: "선호하는 맛은?", options: ["담백한", "매운", "짠", "고소한"] },
    { id: "avoid", question: "피하고 싶은 재료가 있나요?", options: ["없음", "해산물", "밀가루", "육류", "매운것"] },
    // { id: "recent", question: "최근 먹은 점심은?", options: ["김치찌개", "돈까스", "샐러드", "라면"] },
    { id: "mealPlace", question: "식사 장소는 어디인가요?", options: ["외부 식당", "배달", "집", "회사", "학교"] },
    { id: "desire", question: "오늘 점심에 바라는 건?", options: ["든든함", "건강", "맛", "편의성", "가벼움", "위로받고 싶음"] }

];


const questionSection = document.getElementById("question-section");
const questionContainer = document.getElementById("question-container");
const form = document.getElementById("question-form");
const resultSection = document.getElementById("result-section");
const menuResult = document.getElementById("menu-result");
let recommendedMenu = "";

function createQuestion({ id, question, options }) {
    const div = document.createElement("div");
    div.className = "question-block";
    const label = document.createElement("label");
    label.innerText = question;
    div.appendChild(label);

    const select = document.createElement("select");
    select.id = id;
    select.required = true;
    options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.innerText = opt;
        select.appendChild(option);
    });
    div.appendChild(select);
    return div;
}

function loadQuestions() {
    questionList.forEach(q => {
        questionContainer.appendChild(createQuestion(q));
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Loading...";

    const answers = {};
    questionList.forEach(q => {
        const el = document.getElementById(q.id);
        answers[q.id] = el.value;
    });

    const prompt = `사용자의 점심 메뉴를 추천해주세요. 조건:
${Object.entries(answers).map(([k, v]) => `- ${k}: ${v}`).join("\n")}
형식: \n추천 메뉴: \n추천 이유:`;
    //console.log(prompt);

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "당신은 점심 메뉴를 추천해주는 전문가입니다." },
                    { role: "user", content: prompt }
                ]
            })
        });
        const data = await response.json();
        //console.log(data);
        const resultText = data.choices[0].message.content;

        questionSection.style.display = "none";
        resultSection.style.display = "block";
        menuResult.innerText = resultText;
        recommendedMenu = resultText.match(/추천 메뉴:\s*(.+)/)?.[1] || "";
    } catch (err) {
        menuResult.innerText = "메뉴 추천 중 오류가 발생했습니다.";
        console.error(err);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

window.addEventListener("DOMContentLoaded", loadQuestions);

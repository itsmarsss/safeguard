let data = {
    domain: "Pending...",
    domainScore: 0,
    contentScore: 0,
    seScore: 0
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    sendResponse({ data });
});

const shadowContainer = document.createElement("div");
const shadowRoot = shadowContainer.attachShadow({ mode: "open" });

const style = document.createElement("style");
style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

.safeguard {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100px;
    height: 100px;
    border-top-left-radius: 50%;
    background: white;
    padding: 10px;
    box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.8);
    z-index: 2147483647;
}

.safeguard::before {
    content: "";
    background: transparent;
    width: 70px;
    height: 70px;
    display: block;
    position: absolute;
    right: 0px;
    top: -70px;
    border-radius: 50%;
    box-shadow: white 35px 35px;
}

.safeguard::after {
    content: "";
    background: transparent;
    width: 70px;
    height: 70px;
    display: block;
    position: absolute;
    left: -70px;
    bottom: 0;
    border-radius: 50%;
    box-shadow: white 35px 35px;
}

.circular-progress {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #dad3f8;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.8);
    z-index: 2;
    position: relative;
}

.inner-circle {
    position: absolute;
    width: 75px;
    height: 75px;
    border-radius: 50%;
    background: #3c3c43;
}

.percentage {
    position: relative;
    font-size: 10px;
    color: #fffdff;
    font-family: 'Poppins', Courier, monospace;
}
`;
const content = document.createElement("div");
content.className = "safeguard";

const circularProgress = document.createElement("div");
circularProgress.className = "circular-progress";

const innerCircle = document.createElement("div");
innerCircle.className = "inner-circle";

const percentage = document.createElement("p");
percentage.className = "percentage";
percentage.textContent = "Analysing...";

circularProgress.appendChild(innerCircle);
circularProgress.appendChild(percentage);

content.appendChild(circularProgress);

shadowRoot.appendChild(style);
shadowRoot.appendChild(content);

document.body.appendChild(shadowContainer);

setTimeout(() => {
    const html = document.documentElement.outerHTML;

    chrome.runtime.sendMessage({ html: html }, function (response) {
        if (response.message) {
            data = {
                domain: window.location.origin,
                ...response.message
            };
            const { domainScore, contentScore, seScore } = data;
            const finalScore = 0.15 * domainScore + 0.5 * contentScore + 0 * seScore;
            const category = categorizeScore(finalScore);

            const endValue = finalScore;

            percentage.style.fontSize = "15px";

            let startValue = 0;
            let lastTimestamp = performance.now();
            let animationFrameId;

            const animate = (timestamp) => {
                const deltaTime = timestamp - lastTimestamp;
                const speed = 100;
                startValue += (deltaTime / 1000) * speed;

                startValue = Math.min(startValue, endValue);

                percentage.textContent = `${Math.floor(startValue)}%`;

                circularProgress.style.background = `conic-gradient(#6a5acd ${startValue * 3.6}deg, #e2dbff 0deg)`;

                if (startValue >= endValue) {
                    cancelAnimationFrame(animationFrameId);
                    return;
                }

                animationFrameId = requestAnimationFrame(animate);
                lastTimestamp = timestamp;
            };

            animationFrameId = requestAnimationFrame(animate);

            return () => {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
            };
        }
    });
}, 5000);

function categorizeScore(score) {
    if (score > 60) {
        return "Noble";
    } else if (score > 30) {
        return "Questionable";
    } else {
        return "Bull";
    }
}
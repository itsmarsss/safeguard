const shadowContainer = document.createElement("div");
const shadowRoot = shadowContainer.attachShadow({ mode: "open" });

const style = document.createElement("style");
style.textContent = `
  .safeguard {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: white;
    padding: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
  }
`;
const content = document.createElement("div");
content.className = "safeguard";
content.textContent = "Analysing...";

shadowRoot.appendChild(style);
shadowRoot.appendChild(content);

document.body.appendChild(shadowContainer);

setTimeout(() => {
    const html = document.documentElement.outerHTML;

    chrome.runtime.sendMessage({ html: html }, function (response) {
        if (response.message) {
            const { domainScore, contentScore, seScore } = response.message;
            const finalScore = 0.15 * domainScore + 0.5 * contentScore + 0 * seScore;
            const category = categorizeScore(finalScore);

            console.log(finalScore, category);

            content.textContent = finalScore;
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
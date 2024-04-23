import { useEffect, useState } from "react";
import "./App.css";
import Dial from "./components/dial";

function App() {
  const [domain, setDomain] = useState<string>("Pending...");
  const [overallScore, setOverallScore] = useState<number>(0);
  const [domainScore, setDomainScore] = useState<number>(0);
  const [contentScore, setContentScore] = useState<number>(0);
  const [seScore, setSeScore] = useState<number>(0);

  useEffect(() => {
    const queryData = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs.length > 0 && tabs[0].id !== undefined) {
          chrome.tabs.sendMessage(tabs[0].id, {}, function (response) {
            if (response.data) {
              const { domain, domainScore, contentScore, seScore } =
                response.data;
              setDomain(domain);
              setOverallScore(
                0.15 * domainScore + 0.5 * contentScore + 0 * seScore
              );
              setDomainScore(domainScore);
              setContentScore(contentScore);
              setSeScore(seScore);
            }
          });
        } else {
          console.error("No active tab found.");
        }
      });
    };

    queryData();
    setInterval(queryData, 1000);
  }, []);

  return (
    <>
      <div className="navbar">
        <img className="logo" src="./5aa644ba39b2f7238767.png" />
        <div className="safeguard">BULL OR NOBLE</div>
      </div>
      <div className="topbar">
        <b>Unleash the BullMeter!</b>
        <span className="url-display">{domain}</span>
      </div>
      <div className="checks">
        <div className="metacarpal-pad">
          <Dial
            main={true}
            circle_color={"#f0f0f0"}
            progress_color={"#6a5acd"}
            percentage={overallScore}
            text={"Overall Score"}
          />
        </div>
        <div className="checks-secondary">
          <div className="digital-pad-1">
            <Dial
              main={false}
              circle_color={"#f0f0f0"}
              progress_color={"#40b5ad"}
              percentage={domainScore}
              text={"Prelim Check"}
            />
          </div>
          <div className="digital-pad-2">
            <Dial
              main={false}
              circle_color={"#f0f0f0"}
              progress_color={"#ff69b4"}
              percentage={contentScore}
              text={"Content Check"}
            />
          </div>
          <div className="digital-pad-3">
            <Dial
              main={false}
              circle_color={"#f0f0f0"}
              progress_color={"#4682b4"}
              percentage={seScore}
              text={"SE Ranking"}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

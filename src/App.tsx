import "./App.css";
import Dial from "./components/dial";

function App() {
  return (
    <>
      <div className="navbar">
        <img className="logo" src="./5aa644ba39b2f7238767.png" />
        <div className="safeguard">BULL OR NOBLE</div>
      </div>
      <div className="topbar">
        <b>Unleash the BullMeter!</b>
        <span className="url-display">https://website.domain/</span>
      </div>
      <div className="checks">
        <div className="metacarpal-pad">
          <Dial
            main={true}
            circle_color={"#f0f0f0"}
            progress_color={"SlateBlue"}
            percentage={50}
            text={"Overall Score"}
          />
        </div>
        <div className="checks-secondary">
          <div className="digital-pad-1">
            <Dial
              main={false}
              circle_color={"#f0f0f0"}
              progress_color={"#40b5ad"}
              percentage={50}
              text={"Prelim Check"}
            />
          </div>
          <div className="digital-pad-2">
            <Dial
              main={false}
              circle_color={"#f0f0f0"}
              progress_color={"hotpink"}
              percentage={50}
              text={"Content Check"}
            />
          </div>
          <div className="digital-pad-3">
            <Dial
              main={false}
              circle_color={"#f0f0f0"}
              progress_color={"#4682b4"}
              percentage={50}
              text={"SE Ranking"}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

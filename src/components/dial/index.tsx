import { useEffect, useRef } from "react";
import "./style.css";

type DialProps = {
  main: boolean;
  circle_color: string;
  progress_color: string;
  percentage: number;
  text: string;
};

const Dial: React.FC<DialProps> = (props) => {
  const { main, circle_color, progress_color, percentage, text } = props;

  const circularRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const progressValue = circularRef.current?.querySelector(
      ".percentage"
    ) as HTMLElement;
    const innerCircle = circularRef.current?.querySelector(
      ".inner-circle"
    ) as HTMLElement;
    let startValue = 0,
      endValue = Number(circularRef.current?.getAttribute("data-percentage")),
      speed = (100 - endValue) / 2,
      progressColor = circularRef.current?.getAttribute("data-progress-color");

    const progress = setInterval(() => {
      if (progressValue) {
        progressValue.textContent = `${startValue}%`;
        progressValue.style.color = `${progressColor}`;
      }

      innerCircle.style.backgroundColor = `${circularRef.current?.getAttribute(
        "data-inner-circle-color"
      )}`;

      if (circularRef.current) {
        circularRef.current.style.background = `conic-gradient(${progressColor} ${
          startValue * 3.6
        }deg, #e2dbff 0deg)`;
      }
      if (startValue >= endValue) {
        clearInterval(progress);
      }
      startValue++;
    }, speed);
  }, []);

  return (
    <>
      <div className={"dial" + (main ? " main-dial" : "")}>
        <div
          ref={circularRef}
          className="circular-progress"
          data-inner-circle-color={circle_color}
          data-progress-color={progress_color}
          data-percentage={percentage}
        >
          <div className="inner-circle"></div>
          <p className="percentage">{percentage}%</p>
        </div>
        <span className="score-name">{text}</span>
      </div>
    </>
  );
};

export default Dial;

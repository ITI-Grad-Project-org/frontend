import "./ai-queue-loader.css";

const LOADER_WORD = "Generating";

export function AIQueueLoader() {
  return (
    <div className="ai-queue-loader" aria-label="Generating your plan" role="status">
      <div className="loader-wrapper" aria-hidden="true">
        {Array.from(LOADER_WORD).map((letter, index) => (
          <span key={index} className="loader-letter">
            {letter}
          </span>
        ))}
        <div className="loader" />
      </div>
    </div>
  );
}
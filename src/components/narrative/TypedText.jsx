export default function TypedText({ text, count }) {
  const visibleText = text.slice(0, count);
  const withDamageHighlight = (value) => value.split(/(HP\s*-\s*\d+|SAN\s*-\s*\d+)/gi).map((part, index) =>
    /^(HP|SAN)\s*-\s*\d+$/i.test(part) ? <span className="typed-damage" key={index}>{part}</span> : part
  );
  return (
    <span className="typed-text" aria-label={text}>
      <span className="typed-reserve" aria-hidden="true">{text}</span>
      <span className="typed-visible" aria-hidden="true">{withDamageHighlight(visibleText)}{count < text.length && <span className="typing-cursor">▌</span>}</span>
    </span>
  );
}

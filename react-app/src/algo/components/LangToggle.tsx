import { useLang } from "../lang";

/** EN / 中文 switch for problem titles and statements (remembered per browser) */
export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="algo-lang" role="group" aria-label="Language / 語言">
      <button className={lang === "en" ? "is-on" : ""} aria-pressed={lang === "en"} onClick={() => setLang("en")}>
        EN
      </button>
      <button className={lang === "zh" ? "is-on" : ""} aria-pressed={lang === "zh"} onClick={() => setLang("zh")}>
        中文
      </button>
    </div>
  );
}

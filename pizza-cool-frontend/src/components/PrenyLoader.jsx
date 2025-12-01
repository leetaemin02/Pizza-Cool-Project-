import { useEffect } from "react";

export default function PrenyLoader() {
  useEffect(() => {
    const botId = "692b1d76034a9693f85a3117";
    // Avoid injecting script multiple times
    if (document.querySelector(`script[data-preny-bot-id="${botId}"]`)) return;

    const s = document.createElement("script");
    s.setAttribute("data-name-bot", "PizzaCool");
    s.src = "https://app.preny.ai/embed-global.js";
    s.setAttribute("data-button-style", "width:300px;height:300px;");
    s.setAttribute("data-language", "vi");
    s.async = true;
    s.defer = true;
    s.setAttribute("data-preny-bot-id", botId);

    document.body.appendChild(s);

    return () => {
      // Remove the script tag
      const existingScript = document.querySelector(
        `script[data-preny-bot-id="${botId}"]`
      );
      if (existingScript) existingScript.remove();

      // Try to remove any DOM nodes the widget may have injected.
      // We can't predict all vendor DOM names; remove elements that reference 'preny' in id/class
      const candidates = Array.from(
        document.querySelectorAll(
          '[id^="preny"], [class*="preny"], [data-preny-bot-id]'
        )
      );
      candidates.forEach((el) => el.remove());

      // Also try removing iframes or containers that include 'preny' in src or id
      Array.from(document.getElementsByTagName("iframe")).forEach((f) => {
        try {
          if (
            (f.id && f.id.toLowerCase().includes("preny")) ||
            (f.src && f.src.toLowerCase().includes("preny"))
          ) {
            f.remove();
          }
        } catch {
          // ignore cross-origin access errors
        }
      });
    };
  }, []);

  return null;
}

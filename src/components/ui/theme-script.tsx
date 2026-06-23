/**
 * Inline synchronous script injected into <head> before first paint.
 * Reads the stored theme preference and applies it to <html data-theme>
 * immediately — eliminates flash of wrong theme on every load.
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem('elojovem:theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
      }}
    />
  );
}

import { useEffect } from 'react';

function gaScript(id) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    script.async = true;

    const snippet = document.createElement('script');
    snippet.type = 'text/javascript';
    snippet.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag() { window.dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', '${id}');`;

    document.body.appendChild(script);
    document.body.appendChild(snippet);

    return () => {
      document.body.removeChild(script);
    };
  }, [id]);
}

export default gaScript;

/**
 * GA4 + Microsoft Clarity bootstrap (Section 9). Both are no-ops until real
 * IDs are supplied via env — nothing loads or executes without them, so this
 * is safe to call unconditionally from main.tsx.
 */

const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined
const CLARITY_ID = import.meta.env.VITE_CLARITY_PROJECT_ID as string | undefined

export function initTrackingScripts(): void {
  if (GA4_ID) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer ?? []
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args)
    }
    window.gtag('js', new Date())
    window.gtag('config', GA4_ID)
  }

  if (CLARITY_ID) {
    const script = document.createElement('script')
    script.async = true
    script.innerHTML = `(function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${CLARITY_ID}");`
    document.head.appendChild(script)
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

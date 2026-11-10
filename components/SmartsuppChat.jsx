"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function SmartsuppChat() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    // When entering admin, hide the widget
    if (isAdmin && typeof window !== "undefined" && window.smartsupp) {
      try {
        window.smartsupp("chat:hide");
      } catch {
        // ignore if the API isn't ready
      }
    }

    // When leaving admin, show it again
    if (!isAdmin && typeof window !== "undefined" && window.smartsupp) {
      try {
        window.smartsupp("chat:show");
      } catch {
        // ignore
      }
    }
  }, [isAdmin]);

  if (isAdmin) {
    return null;
  }

  return (
    <Script id="smartsupp-chat" strategy="afterInteractive">
      {`
        var _smartsupp = _smartsupp || {};
        _smartsupp.key = '927ea5d7a03d8ec7bf9f6e31b8b37b001c13d58c';
        window.smartsupp||(function(d) {
          var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
          s=d.getElementsByTagName('script')[0];c=d.createElement('script');
          c.type='text/javascript';c.charset='utf-8';c.async=true;
          c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
        })(document);
      `}
    </Script>
  );
}

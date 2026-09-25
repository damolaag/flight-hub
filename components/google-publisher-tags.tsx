"use client";

import Script from "next/script";

const AD_UNITS = {
  leaderboard: {
    path: "/23043164651/flighthub_banner1",
    divId: "div-gpt-ad-1790265245157-0",
    sizes: [
      [960, 90],
      [970, 90],
      [728, 90],
      [320, 100],
      [320, 50],
      [300, 100],
      [300, 50],
      [300, 250],
      [336, 280],
      "fluid",
    ] as GptSize[],
  },
  leftRail: {
    path: "/23043164651/flighthub_sidebar2",
    divId: "div-gpt-ad-1790266549623-0",
    sizes: [[160, 600], [120, 600], "fluid"] as GptSize[],
  },
  rightRail: {
    path: "/23043164651/flighthub_sidebar1",
    divId: "div-gpt-ad-1790265962301-0",
    sizes: [[160, 600], [120, 600], "fluid"] as GptSize[],
  },
};

const ANCHOR_PATH = "/23043164651/flighthub/flighthub_anchor";

function initializeGooglePublisherTags() {
  const googletag = window.googletag;
  if (!googletag || window.gptFlightHubInitialized) return;

  window.gptFlightHubInitialized = true;
  window.gptRefreshableSlots = [];

  googletag.cmd.push(() => {
    const pubads = googletag.pubads();

    const leaderboardMapping = googletag
      .sizeMapping()
      .addSize([1024, 0], [[970, 90], [960, 90], [728, 90], "fluid"])
      .addSize([768, 0], [[728, 90], [300, 250], "fluid"])
      .addSize([0, 0], [[336, 280], [320, 100], [320, 50], [300, 250], [300, 100], [300, 50], "fluid"])
      .build();

    const railMapping = googletag
      .sizeMapping()
      .addSize([1200, 0], [[160, 600], [120, 600], "fluid"])
      .addSize([0, 0], [])
      .build();

    const slots = [
      { ...AD_UNITS.leaderboard, mapping: leaderboardMapping },
      { ...AD_UNITS.leftRail, mapping: railMapping },
      { ...AD_UNITS.rightRail, mapping: railMapping },
    ];

    slots.forEach(({ path, sizes, divId, mapping }) => {
      const slot = googletag.defineSlot(path, sizes, divId);
      if (!slot) return;
      slot.defineSizeMapping(mapping).addService(pubads);
      window.gptRefreshableSlots?.push(slot);
    });

    const anchorSlot = googletag.defineOutOfPageSlot(
      ANCHOR_PATH,
      googletag.enums.OutOfPageFormat.BOTTOM_ANCHOR,
    );
    if (anchorSlot) anchorSlot.addService(pubads);

    pubads.addEventListener("slotRenderEnded", (event) => {
      const container = document
        .getElementById(event.slot.getSlotElementId())
        ?.closest(".ad-slot");
      container?.classList.toggle("ad-slot-empty", event.isEmpty);
    });

    // Serve non-personalized ads until a consent banner grants ad consent.
    pubads.setPrivacySettings({ nonPersonalizedAds: true });
    pubads.enableSingleRequest();
    pubads.enableLazyLoad({
      fetchMarginPercent: 200,
      renderMarginPercent: 50,
      mobileScaling: 2,
    });
    pubads.setTargeting("sections", ["all"]);
    pubads.collapseEmptyDivs(true);
    googletag.enableServices();

    slots.forEach(({ divId }) => googletag.display(divId));
    if (anchorSlot) googletag.display(anchorSlot);

    // Do not enable timed refresh until these units are declared as refreshing
    // inventory in Google Ad Manager. Consent updates can still refresh once.
  });
}

export function GooglePublisherTags() {
  return (
    <Script
      id="google-publisher-tag"
      src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      onLoad={initializeGooglePublisherTags}
    />
  );
}

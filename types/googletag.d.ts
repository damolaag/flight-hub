export {};

declare global {
  type GptSize = [number, number] | "fluid";

  interface GptSlot {
    addService(service: GptPubAdsService): GptSlot;
    defineSizeMapping(mapping: unknown): GptSlot;
    getSlotElementId(): string;
  }

  interface GptPubAdsService {
    addEventListener(
      eventName: "slotRenderEnded",
      callback: (event: { slot: GptSlot; isEmpty: boolean; size: unknown }) => void,
    ): void;
    addEventListener(
      eventName: "impressionViewable",
      callback: (event: { slot: GptSlot }) => void,
    ): void;
    addEventListener(
      eventName: "slotVisibilityChanged",
      callback: (event: { slot: GptSlot; inViewPercentage: number }) => void,
    ): void;
    collapseEmptyDivs(collapseBeforeAdFetch?: boolean): void;
    enableLazyLoad(options: {
      fetchMarginPercent?: number;
      renderMarginPercent?: number;
      mobileScaling?: number;
    }): void;
    enableSingleRequest(): void;
    refresh(slots?: GptSlot[]): void;
    setPrivacySettings(settings: { nonPersonalizedAds?: boolean }): void;
    setTargeting(key: string, value: string | string[]): void;
  }

  interface GptSizeMappingBuilder {
    addSize(viewportSize: [number, number], slotSize: GptSize[]): GptSizeMappingBuilder;
    build(): unknown;
  }

  interface GoogleTagApi {
    apiReady?: boolean;
    cmd: { push(callback: () => void): number | void };
    defineOutOfPageSlot(path: string, format: string): GptSlot | null;
    defineSlot(path: string, sizes: GptSize[], divId: string): GptSlot | null;
    display(slotOrDivId: GptSlot | string): void;
    enableServices(): void;
    enums: { OutOfPageFormat: { BOTTOM_ANCHOR: string } };
    pubads(): GptPubAdsService;
    sizeMapping(): GptSizeMappingBuilder;
  }

  interface Window {
    googletag?: GoogleTagApi;
    gptFlightHubInitialized?: boolean;
    gptRefreshableSlots?: GptSlot[];
    updateGptConsentState?: (
      consentedToAds: boolean,
      consentedToAnalytics: boolean,
    ) => void;
  }
}

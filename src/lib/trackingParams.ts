// Ad-click identifiers that must survive any client-side URL rewrite, so the
// landing URL stays intact for GTM / Google Ads / Meta and for anyone who shares or reloads it.
const TRACKING_PARAM = /^(gclid|gbraid|wbraid|fbclid|gad_source|gad_campaignid|msclkid|utm_.+)$/i;

/** Copies only the ad-tracking params from `source` onto `target` (a page's own URLSearchParams being built). */
export function keepTrackingParams(source: { forEach: (cb: (value: string, key: string) => void) => void }, target: URLSearchParams) {
  source.forEach((value, key) => {
    if (TRACKING_PARAM.test(key)) target.set(key, value);
  });
}

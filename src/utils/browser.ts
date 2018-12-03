const documentElement = (document.documentElement as HTMLElement);
export const viewPortWidth = Math.max(documentElement.clientWidth, window.innerWidth || 0);
export const viewPortHeight = Math.max(documentElement.clientHeight, window.innerHeight || 0);


const { userAgent: ua } = navigator;
export const isIPhone = ua.includes('iPhone');
export const isIPad = ua.includes('iPad');
export const isAndroid = ua.includes('Android');
export const isIOS = isIPhone || isIPad;
export const isMobile = isIOS || isAndroid;


// https://ant.design/components/grid
export enum BreakPoints {
  XXS = 320, // ≤ iPhone 5s/SE
  XS = 576, // <
  SM = 576, // ≥
  MD = 768, // ≥
  LG = 992, // ≥
  XL = 1200, // ≥
  XXL = 1600, // ≥
}

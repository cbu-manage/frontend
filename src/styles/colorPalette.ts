export const grayPalette = {
  0: "#ffffff",
  50: "#F5F6F8",
  100: "#EEEFF3",
  200: "#E3E7ED",
  300: "#C7CBD1",
  500: "#A3A8B0",
  600: "#959AA3",
  800: "#333333",
  900: "#222222",
} as const;

export type GrayShade = keyof typeof grayPalette;

export const getGray = (shade: GrayShade) => grayPalette[shade];

export const accentColors = {
  brand: "#95C674",
  notice: "#FF4E4E",
} as const;



import type { ColorThemeId } from 'types/settings';

import config from 'configs/app';
import type { ColorMode } from 'toolkit/chakra/color-mode';

export interface ColorTheme {
  id: ColorThemeId;
  label: string;
  colorMode: ColorMode;
  hex: string;
  sampleBg: string;
}

const getNestedValue = (obj: Record<string, unknown>, property: string) => {
  const keys = property.split('.');
  let current = obj;
  for (const key of keys) {
    const value = current[key];
    if (value === undefined) {
      return undefined;
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      current = value as Record<string, unknown>;
    } else {
      return value;
    }
  }
};

export function getThemeHexWithOverrides(colorThemeId: ColorThemeId) {
  const defaultHex = COLOR_THEMES.find((theme) => theme.id === colorThemeId)?.hex;

  if (!defaultHex) {
    return;
  }

  const overrides = config.UI.colorTheme.overrides;
  if (colorThemeId === 'light') {
    const value = getNestedValue(overrides, 'bg.primary._light.value');
    return typeof value === 'string' ? value : defaultHex;
  }

  if (colorThemeId === 'dark') {
    const value = getNestedValue(overrides, 'bg.primary._dark.value');
    return typeof value === 'string' ? value : defaultHex;
  }

  return defaultHex;
};

export function getDefaultColorTheme(colorMode: ColorMode) {
  const colorTheme = COLOR_THEMES.filter((theme) => theme.colorMode === colorMode).slice(-1)[0];

  return colorTheme.id;
}

export const COLOR_THEMES: Array<ColorTheme> = [
  {
    id: 'light',
    label: 'Light',
    colorMode: 'light',
    hex: '#F5F5F5',
    sampleBg: 'linear-gradient(154deg, #F5F5F5 50%, rgba(245, 245, 245, 0.00) 330.86%)',
  },
  {
    id: 'dark',
    label: 'Dark',
    colorMode: 'dark',
    hex: '#070707',
    sampleBg: 'linear-gradient(161deg, #070707 9.37%, #2a2a2a 92.52%)',
  },
];

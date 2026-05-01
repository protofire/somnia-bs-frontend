import { defaultsDeep } from 'es-toolkit/compat';

import config from 'configs/app';

const DEFAULT_THEME_COLORS = {
  bg: {
    primary: {
      // for some reason links to colors.white and colors.black variables are not working here
      // so we use hex values instead
      // but it is not the case for other colors
      _light: { value: '#F5F5F5' }, // Somnia off-white
      _dark: { value: '#070707' }, // Somnia dark
    },
  },
  text: {
    primary: {
      _light: { value: '{colors.gray.700}' }, // #252525
      _dark: { value: '{colors.whiteAlpha.800}' },
    },
    secondary: {
      _light: { value: '{colors.gray.500}' }, // #4C4C4C
      _dark: { value: '{colors.gray.400}' },
    },
  },
  hover: {
    _light: { value: '{colors.purple.400}' },
    _dark: { value: '{colors.purple.400}' },
  },
  selected: {
    control: {
      text: {
        _light: { value: '{colors.purple.700}' },
        _dark: { value: '{colors.gray.50}' },
      },
      bg: {
        _light: { value: '{colors.purple.100}' }, // purple.50 = #FAF5FF ≈ bg, use 100 for contrast
        _dark: { value: '{colors.whiteAlpha.50}' },
      },
    },
    option: {
      bg: {
        _light: { value: '{colors.purple.500}' },
        _dark: { value: '{colors.purple.500}' },
      },
    },
  },
  icon: {
    primary: {
      _light: { value: '{colors.gray.500}' },
      _dark: { value: '{colors.gray.400}' },
    },
    secondary: {
      _light: { value: '{colors.gray.400}' },
      _dark: { value: '{colors.gray.500}' },
    },
  },
  button: {
    primary: {
      _light: { value: '{colors.purple.500}' },
      _dark: { value: '{colors.purple.500}' },
      text: {
        _light: { value: '{colors.white}' },
        _dark: { value: '{colors.white}' },
      },
    },
  },
  link: {
    primary: {
      _light: { value: '{colors.purple.500}' },
      _dark: { value: '{colors.purple.300}' },
    },
  },
  graph: {
    line: {
      _light: { value: '{colors.purple.500}' },
      _dark: { value: '{colors.purple.300}' },
    },
    gradient: {
      start: {
        _light: { value: 'rgba(119, 27, 232, 0.3)' }, // purple.500 with opacity 0.3
        _dark: { value: 'rgba(119, 27, 232, 0.3)' }, // purple.500 with opacity 0.3
      },
      stop: {
        _light: { value: 'rgba(119, 27, 232, 0)' }, // purple.500 with opacity 0
        _dark: { value: 'rgba(119, 27, 232, 0)' }, // purple.500 with opacity 0
      },
    },
  },
  navigation: {
    bg: {
      selected: {
        _light: { value: '{colors.purple.100}' }, // purple.50 = #FAF5FF ≈ bg, use 100 for contrast
        _dark: { value: '{colors.gray.800}' },
      },
    },
    text: {
      selected: {
        _light: { value: '{colors.purple.700}' },
        _dark: { value: '{colors.gray.50}' },
      },
    },
  },
  stats: {
    bg: {
      _light: { value: '{colors.gray.100}' }, // gray.50 = #F5F5F5 = page bg, use 100 for contrast
      _dark: { value: '{colors.whiteAlpha.100}' },
    },
  },
  topbar: {
    bg: {
      _light: { value: '{colors.gray.100}' }, // gray.50 = #F5F5F5 = page bg, use 100 for contrast
      _dark: { value: '{colors.whiteAlpha.100}' },
    },
  },
  tabs: {
    text: {
      primary: {
        _light: { value: '{colors.purple.700}' },
        _dark: { value: '{colors.purple.200}' },
      },
    },
  },
};

const colors = {
  // BASE COLORS
  green: {
    '50': { value: '#F0FFF4' },
    '100': { value: '#C6F6D5' },
    '200': { value: '#9AE6B4' },
    '300': { value: '#68D391' },
    '400': { value: '#48BB78' },
    '500': { value: '#38A169' },
    '600': { value: '#25855A' },
    '700': { value: '#276749' },
    '800': { value: '#22543D' },
    '900': { value: '#1C4532' },
  },
  blue: {
    '50': { value: '#EBF8FF' },
    '100': { value: '#BEE3F8' },
    '200': { value: '#90CDF4' },
    '300': { value: '#63B3ED' },
    '400': { value: '#4299E1' },
    '500': { value: '#3182CE' },
    '600': { value: '#2B6CB0' },
    '700': { value: '#2C5282' },
    '800': { value: '#2A4365' },
    '900': { value: '#1A365D' },
  },
  red: {
    '50': { value: '#FFF5F5' },
    '100': { value: '#FED7D7' },
    '200': { value: '#FEB2B2' },
    '300': { value: '#FC8181' },
    '400': { value: '#F56565' },
    '500': { value: '#E53E3E' },
    '600': { value: '#C53030' },
    '700': { value: '#9B2C2C' },
    '800': { value: '#822727' },
    '900': { value: '#63171B' },
  },
  orange: {
    '50': { value: '#FFFAF0' },
    '100': { value: '#FEEBCB' },
    '200': { value: '#FBD38D' },
    '300': { value: '#F6AD55' },
    '400': { value: '#ED8936' },
    '500': { value: '#DD6B20' },
    '600': { value: '#C05621' },
    '700': { value: '#9C4221' },
    '800': { value: '#7B341E' },
    '900': { value: '#652B19' },
  },
  yellow: {
    '50': { value: '#FFFFF0' },
    '100': { value: '#FEFCBF' },
    '200': { value: '#FAF089' },
    '300': { value: '#F6E05E' },
    '400': { value: '#ECC94B' },
    '500': { value: '#D69E2E' },
    '600': { value: '#B7791F' },
    '700': { value: '#975A16' },
    '800': { value: '#744210' },
    '900': { value: '#5F370E' },
  },
  gray: {
    '50': { value: '#F5F5F5' }, // off-white
    '100': { value: '#E6E6E6' }, // light panels / borders
    '200': { value: '#C8C8C8' },
    '300': { value: '#A5A5A5' },
    '400': { value: '#7A7A7A' },
    '500': { value: '#4C4C4C' }, // secondary text / icons
    '600': { value: '#383838' },
    '700': { value: '#252525' }, // primary body text
    '800': { value: '#111111' }, // headings
    '900': { value: '#070707' }, // darkest
  },
  teal: {
    '50': { value: '#E6FFFA' },
    '100': { value: '#B2F5EA' },
    '200': { value: '#81E6D9' },
    '300': { value: '#4FD1C5' },
    '400': { value: '#38B2AC' },
    '500': { value: '#319795' },
    '600': { value: '#2C7A7B' },
    '700': { value: '#285E61' },
    '800': { value: '#234E52' },
    '900': { value: '#1D4044' },
  },
  cyan: {
    '50': { value: '#EDFDFD' },
    '100': { value: '#C4F1F9' },
    '200': { value: '#9DECF9' },
    '300': { value: '#76E4F7' },
    '400': { value: '#0BC5EA' },
    '500': { value: '#00B5D8' },
    '600': { value: '#00A3C4' },
    '700': { value: '#0987A0' },
    '800': { value: '#086F83' },
    '900': { value: '#065666' },
  },
  purple: {
    '50': { value: '#FAF5FF' },
    '100': { value: '#EDD8FF' },
    '200': { value: '#CFA0FF' },
    '300': { value: '#B06AFF' },
    '400': { value: '#9344EE' },
    '500': { value: '#771BE8' }, // Somnia primary purple
    '600': { value: '#6012C9' },
    '700': { value: '#4A0DA0' },
    '800': { value: '#360B76' },
    '900': { value: '#22064C' },
  },
  pink: {
    '50': { value: '#FFF5F7' },
    '100': { value: '#FED7E2' },
    '200': { value: '#FBB6CE' },
    '300': { value: '#F687B3' },
    '400': { value: '#ED64A6' },
    '500': { value: '#D53F8C' },
    '600': { value: '#B83280' },
    '700': { value: '#97266D' },
    '800': { value: '#702459' },
    '900': { value: '#521B41' },
  },
  black: { value: '#070707' }, // Somnia dark
  white: { value: '#ffffff' },
  whiteAlpha: {
    '50': { value: 'RGBA(255, 255, 255, 0.04)' },
    '100': { value: 'RGBA(255, 255, 255, 0.06)' },
    '200': { value: 'RGBA(255, 255, 255, 0.08)' },
    '300': { value: 'RGBA(255, 255, 255, 0.16)' },
    '400': { value: 'RGBA(255, 255, 255, 0.24)' },
    '500': { value: 'RGBA(255, 255, 255, 0.36)' },
    '600': { value: 'RGBA(255, 255, 255, 0.48)' },
    '700': { value: 'RGBA(255, 255, 255, 0.64)' },
    '800': { value: 'RGBA(255, 255, 255, 0.80)' },
    '900': { value: 'RGBA(255, 255, 255, 0.92)' },
  },
  blackAlpha: {
    '50': { value: 'RGBA(16, 17, 18, 0.04)' },
    '100': { value: 'RGBA(16, 17, 18, 0.06)' },
    '200': { value: 'RGBA(16, 17, 18, 0.08)' },
    '300': { value: 'RGBA(16, 17, 18, 0.16)' },
    '400': { value: 'RGBA(16, 17, 18, 0.24)' },
    '500': { value: 'RGBA(16, 17, 18, 0.36)' },
    '600': { value: 'RGBA(16, 17, 18, 0.48)' },
    '700': { value: 'RGBA(16, 17, 18, 0.64)' },
    '800': { value: 'RGBA(16, 17, 18, 0.80)' },
    '900': { value: 'RGBA(16, 17, 18, 0.92)' },
  },

  // BRAND COLORS
  github: { value: '#171923' },
  telegram: { value: '#2775CA' },
  linkedin: { value: '#1564BA' },
  discord: { value: '#9747FF' },
  slack: { value: '#1BA27A' },
  twitter: { value: '#000000' },
  opensea: { value: '#2081E2' },
  facebook: { value: '#4460A0' },
  medium: { value: '#231F20' },
  reddit: { value: '#FF4500' },
  celo: { value: '#FCFF52' },
  clusters: { value: '#DE6061' },

  // THEME COLORS
  theme: defaultsDeep(config.UI.colorTheme.overrides, DEFAULT_THEME_COLORS),
};

export default colors;

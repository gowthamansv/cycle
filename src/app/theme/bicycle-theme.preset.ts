import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Predefined Primary Color Palettes
 * Default Brand Color: Orange (#ff6a00)
 */
export interface ColorOption {
  name: string;
  value: string;
  color: string;
  palette: Record<number | string, string>;
}

export const PRIMARY_COLOR_PALETTES: Record<string, Record<number | string, string>> = {
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#ff6a00', // Brand Primary Orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  purple: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
};

export const PRIMARY_COLOR_OPTIONS: ColorOption[] = [
  { name: 'Orange', value: 'orange', color: '#ff6a00', palette: PRIMARY_COLOR_PALETTES['orange'] },
  { name: 'Blue', value: 'blue', color: '#3b82f6', palette: PRIMARY_COLOR_PALETTES['blue'] },
  { name: 'Cyan', value: 'cyan', color: '#06b6d4', palette: PRIMARY_COLOR_PALETTES['cyan'] },
  { name: 'Green', value: 'green', color: '#22c55e', palette: PRIMARY_COLOR_PALETTES['green'] },
  { name: 'Purple', value: 'purple', color: '#8b5cf6', palette: PRIMARY_COLOR_PALETTES['purple'] },
  { name: 'Red', value: 'red', color: '#ef4444', palette: PRIMARY_COLOR_PALETTES['red'] },
];

export const BICYCLE_BRAND_SURFACES = {
  light: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  dark: {
    0: '#ffffff',
    50: '#262626',
    100: '#1e1e1e',
    200: '#2a2a2a',
    300: '#383838',
    400: '#a3a3a3', // Brand Muted Text
    500: '#737373',
    600: '#525252',
    700: '#2a2a2a',
    800: '#1a1a1a', // Brand Elevated Surface
    900: '#121212', // Brand Secondary Dark
    950: '#050505', // Brand Dark Body
  },
};

export const BicyclePreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
    },
    orange: PRIMARY_COLOR_PALETTES['orange'],
  },
  semantic: {
    primary: PRIMARY_COLOR_PALETTES['orange'],
    colorScheme: {
      light: {
        surface: BICYCLE_BRAND_SURFACES.light,
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.700}',
          focusColor: '{primary.800}',
        },
        formField: {
          background: '#ffffff',
          disabledBackground: '{surface.100}',
          filledBackground: '{surface.50}',
          filledHoverBackground: '{surface.100}',
          filledFocusBackground: '#ffffff',
          borderColor: '{surface.300}',
          hoverBorderColor: '{surface.400}',
          focusBorderColor: '{primary.500}',
          invalidBorderColor: '#ef4444',
          color: '{surface.900}',
          disabledColor: '{surface.400}',
          placeholderColor: '{surface.400}',
          shadow: '0 0 #0000',
          paddingX: '0.75rem',
          paddingY: '0.5rem',
          borderRadius: '6px',
          transitionDuration: '0.2s',
        },
        content: {
          background: '#ffffff',
          hoverBackground: '{surface.100}',
          borderColor: '{surface.200}',
          color: '{surface.800}',
          hoverColor: '{surface.900}',
        },
        overlay: {
          select: {
            background: '#ffffff',
            borderColor: '{surface.200}',
            color: '{surface.800}',
          },
          popover: {
            background: '#ffffff',
            borderColor: '{surface.200}',
            color: '{surface.800}',
          },
          modal: {
            background: '#ffffff',
            borderColor: '{surface.200}',
            color: '{surface.800}',
          },
        },
      },
      dark: {
        surface: BICYCLE_BRAND_SURFACES.dark,
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.400}',
          activeColor: '{primary.300}',
        },
        highlight: {
          background: 'color-mix(in srgb, {primary.500}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {primary.500}, transparent 76%)',
          color: '{primary.400}',
          focusColor: '{primary.300}',
        },
        formField: {
          background: '#121212',
          disabledBackground: '#1a1a1a',
          filledBackground: '#1a1a1a',
          filledHoverBackground: '#262626',
          filledFocusBackground: '#121212',
          borderColor: '#333333',
          hoverBorderColor: '#525252',
          focusBorderColor: '{primary.500}',
          invalidBorderColor: '#f87171',
          color: '#ffffff',
          disabledColor: '#737373',
          placeholderColor: '#a3a3a3',
          shadow: '0 0 #0000',
          paddingX: '0.75rem',
          paddingY: '0.5rem',
          borderRadius: '6px',
          transitionDuration: '0.2s',
        },
        content: {
          background: '#121212',
          hoverBackground: '#1a1a1a',
          borderColor: '#262626',
          color: '#ffffff',
          hoverColor: '#ffffff',
        },
        overlay: {
          select: {
            background: '#121212',
            borderColor: '#262626',
            color: '#ffffff',
          },
          popover: {
            background: '#121212',
            borderColor: '#262626',
            color: '#ffffff',
          },
          modal: {
            background: '#121212',
            borderColor: '#262626',
            color: '#ffffff',
          },
        },
      },
    },
  },
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            primary: {
              background: '{primary.500}',
              hoverBackground: '{primary.600}',
              activeBackground: '{primary.700}',
              borderColor: '{primary.500}',
              hoverBorderColor: '{primary.600}',
              activeBorderColor: '{primary.700}',
              color: '#ffffff',
            },
          },
        },
        dark: {
          root: {
            primary: {
              background: '{primary.500}',
              hoverBackground: '{primary.600}',
              activeBackground: '{primary.700}',
              borderColor: '{primary.500}',
              hoverBorderColor: '{primary.600}',
              activeBorderColor: '{primary.700}',
              color: '#ffffff',
            },
          },
        },
      },
    },
    menubar: {
      colorScheme: {
        light: {
          root: {
            background: '#ffffff',
            borderColor: '{surface.200}',
            borderRadius: '8px',
            color: '{surface.800}',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
          },
          item: {
            focusBackground: '{surface.100}',
            activeBackground: '{surface.100}',
            color: '{surface.700}',
            focusColor: '{primary.500}',
            activeColor: '{primary.500}',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            icon: {
              color: '{surface.500}',
              focusColor: '{primary.500}',
              activeColor: '{primary.500}',
            },
          },
          submenu: {
            background: '#ffffff',
            borderColor: '{surface.200}',
            borderRadius: '8px',
            shadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            padding: '0.5rem',
            gap: '2px',
          },
        },
        dark: {
          root: {
            background: '#121212',
            borderColor: '#262626',
            borderRadius: '8px',
            color: '#ffffff',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
          },
          item: {
            focusBackground: '#262626',
            activeBackground: '#262626',
            color: '#e5e7eb',
            focusColor: '{primary.500}',
            activeColor: '{primary.500}',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            icon: {
              color: '#a3a3a3',
              focusColor: '{primary.500}',
              activeColor: '{primary.500}',
            },
          },
          submenu: {
            background: '#1a1a1a',
            borderColor: '#262626',
            borderRadius: '8px',
            shadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
            padding: '0.5rem',
            gap: '2px',
          },
        },
      },
    },
    megamenu: {
      colorScheme: {
        light: {
          root: {
            background: '#ffffff',
            borderColor: '{surface.200}',
            color: '{surface.800}',
          },
          item: {
            focusBackground: '{surface.100}',
            color: '{surface.700}',
            focusColor: '{primary.500}',
          },
          overlay: {
            background: '#ffffff',
            borderColor: '{surface.200}',
            shadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          },
        },
        dark: {
          root: {
            background: '#121212',
            borderColor: '#262626',
            color: '#ffffff',
          },
          item: {
            focusBackground: '#262626',
            color: '#e5e7eb',
            focusColor: '{primary.500}',
          },
          overlay: {
            background: '#1a1a1a',
            borderColor: '#262626',
            shadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    drawer: {
      colorScheme: {
        light: {
          root: {
            background: '#ffffff',
            borderColor: '{surface.200}',
            color: '{surface.800}',
            shadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          },
        },
        dark: {
          root: {
            background: '#121212',
            borderColor: '#262626',
            color: '#ffffff',
            shadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          },
        },
      },
    },
    dialog: {
      colorScheme: {
        light: {
          root: {
            background: '#ffffff',
            borderColor: '{surface.200}',
            color: '{surface.800}',
            shadow: '0 20px 30px rgba(0, 0, 0, 0.12)',
            borderRadius: '12px',
          },
          header: {
            padding: '1.25rem 1.5rem',
          },
          title: {
            fontSize: '1.25rem',
            fontWeight: '600',
          },
          content: {
            padding: '0 1.5rem 1.5rem 1.5rem',
          },
          footer: {
            padding: '0 1.5rem 1.5rem 1.5rem',
          },
        },
        dark: {
          root: {
            background: '#121212',
            borderColor: '#262626',
            color: '#ffffff',
            shadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
          },
          header: {
            padding: '1.25rem 1.5rem',
          },
          title: {
            fontSize: '1.25rem',
            fontWeight: '600',
          },
          content: {
            padding: '0 1.5rem 1.5rem 1.5rem',
          },
          footer: {
            padding: '0 1.5rem 1.5rem 1.5rem',
          },
        },
      },
    },
    card: {
      colorScheme: {
        light: {
          root: {
            background: '#ffffff',
            color: '{surface.800}',
            borderRadius: '10px',
            shadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          },
          title: {
            fontSize: '1.25rem',
            fontWeight: '600',
          },
          subtitle: {
            color: '{surface.400}',
          },
        },
        dark: {
          root: {
            background: '#121212',
            color: '#ffffff',
            borderRadius: '10px',
            shadow: '0 4px 20px rgba(0,0,0,0.3)',
          },
          title: {
            fontSize: '1.25rem',
            fontWeight: '600',
          },
          subtitle: {
            color: '#a3a3a3',
          },
        },
      },
    },
    datatable: {
      colorScheme: {
        light: {
          root: {
            borderColor: '{surface.200}',
          },
          header: {
            background: '#ffffff',
            borderColor: '{surface.200}',
            color: '{surface.900}',
          },
          headerCell: {
            background: '{surface.50}',
            hoverBackground: '{surface.100}',
            borderColor: '{surface.200}',
            color: '{surface.700}',
          },
          row: {
            background: '#ffffff',
            hoverBackground: '{surface.50}',
            color: '{surface.800}',
          },
          footer: {
            background: '#ffffff',
            borderColor: '{surface.200}',
            color: '{surface.800}',
          },
        },
        dark: {
          root: {
            borderColor: '#262626',
          },
          header: {
            background: '#121212',
            borderColor: '#262626',
            color: '#ffffff',
          },
          headerCell: {
            background: '#1a1a1a',
            hoverBackground: '#262626',
            borderColor: '#262626',
            color: '#e5e7eb',
          },
          row: {
            background: '#121212',
            hoverBackground: '#1a1a1a',
            color: '#ffffff',
          },
          footer: {
            background: '#121212',
            borderColor: '#262626',
            color: '#ffffff',
          },
        },
      },
    },
    inputtext: {
      colorScheme: {
        light: {
          root: {
            background: '#ffffff',
            disabledBackground: '{surface.100}',
            borderColor: '{surface.300}',
            hoverBorderColor: '{surface.400}',
            focusBorderColor: '{primary.500}',
            invalidBorderColor: '#ef4444',
            color: '{surface.900}',
            disabledColor: '{surface.400}',
            placeholderColor: '{surface.400}',
            shadow: 'none',
          },
        },
        dark: {
          root: {
            background: '#121212',
            disabledBackground: '#1a1a1a',
            borderColor: '#333333',
            hoverBorderColor: '#525252',
            focusBorderColor: '{primary.500}',
            invalidBorderColor: '#f87171',
            color: '#ffffff',
            disabledColor: '#737373',
            placeholderColor: '#a3a3a3',
            shadow: 'none',
          },
        },
      },
    },
    password: {
      colorScheme: {
        light: {
          icon: {
            color: '{surface.400}',
          },
        },
        dark: {
          icon: {
            color: '#a3a3a3',
          },
        },
      },
    },
    iconfield: {
      colorScheme: {
        light: {
          icon: {
            color: '{surface.400}',
          },
        },
        dark: {
          icon: {
            color: '#a3a3a3',
          },
        },
      },
    },
    select: {
      colorScheme: {
        light: {
          root: {
            background: '#ffffff',
            disabledBackground: '{surface.100}',
            borderColor: '{surface.300}',
            hoverBorderColor: '{surface.400}',
            focusBorderColor: '{primary.500}',
            color: '{surface.900}',
            placeholderColor: '{surface.400}',
          },
          dropdown: {
            color: '{surface.500}',
          },
          overlay: {
            background: '#ffffff',
            borderColor: '{surface.200}',
            color: '{surface.800}',
            shadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          },
        },
        dark: {
          root: {
            background: '#121212',
            disabledBackground: '#1a1a1a',
            borderColor: '#333333',
            hoverBorderColor: '#525252',
            focusBorderColor: '{primary.500}',
            color: '#ffffff',
            placeholderColor: '#a3a3a3',
          },
          dropdown: {
            color: '#a3a3a3',
          },
          overlay: {
            background: '#1a1a1a',
            borderColor: '#262626',
            color: '#ffffff',
            shadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
  },
});

declare module 'expo-blur' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';

  export const BlurView: ComponentType<
    ViewProps & { tint?: 'light' | 'default' | 'dark'; intensity?: number }
  >;

  export default BlurView;
}

declare module 'react-native-progress/Circle' {
  import * as React from 'react';
  import { ViewStyle, StyleProp } from 'react-native';

  export interface ProgressCircleProps {
    size?: number;
    progress?: number;
    thickness?: number;
    color?: string;
    unfilledColor?: string;
    borderWidth?: number;
    showsText?: boolean;
    style?: StyleProp<ViewStyle>;
    direction?: 'clockwise' | 'counter-clockwise';
    formatText?: (progress: number) => string;
    textStyle?: StyleProp<ViewStyle>;
    allowFontScaling?: boolean;
    strokeCap?: 'butt' | 'round' | 'square';
    children?: React.ReactNode;
  }

  export default class ProgressCircle extends React.Component<ProgressCircleProps> {}
}

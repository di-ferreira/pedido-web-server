import { ReactNode } from 'react';
interface iModalStyle {
  width?: string;
  height?: string;
}
export interface iModalRender extends iModalStyle {
  Title: string;
  OnClose: () => void;
  OnCloseButtonClick?: () => void;
  children?: ReactNode;
  bodyHeight?: string;
  bodyWidth?: string;
  xs?: iModalStyle;
  sm?: iModalStyle;
  md?: iModalStyle;
  lg?: iModalStyle;
  xl?: iModalStyle;
}
export interface iModal extends iModalStyle {
  Title: string;
  OnCloseButtonClick?: () => void;
  children?: ReactNode;
  bodyHeight?: string;
  bodyWidth?: string;
  xs?: iModalStyle;
  sm?: iModalStyle;
  md?: iModalStyle;
  lg?: iModalStyle;
  xl?: iModalStyle;
}

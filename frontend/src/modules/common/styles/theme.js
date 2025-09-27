import { COLORS } from "../constants/colors";

export const THEME = {
  light: {
    page: COLORS.WHITE,
    pageSecondary: COLORS.GREY[50],
    primary: COLORS.BLUE[600],
    success: COLORS.GREEN[500],
    danger: COLORS.RED[500],
    border: {
      primary: COLORS.GREY[100],
      secondary: COLORS.GREY[500],
    },
    text: {
      primary: COLORS.GREY[900],
      secondary: COLORS.GREY[600],
    },
  },
  dark: {
    page: COLORS.GREY[900],
    pageSecondary: COLORS.GREY[950],
    primary: COLORS.BLUE[400],
    success: COLORS.GREEN[400],
    danger: COLORS.RED[400],
    border: {
      primary: COLORS.GREY[700],
      secondary: COLORS.GREY[600],
    },
    text: {
      primary: COLORS.GREY[50],
      secondary: COLORS.GREY[300],
    },
  },
};

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
    page: COLORS.BLACK,
    pageSecondary: COLORS.GREY[950],
    primary: COLORS.BLUE[600],
    success: COLORS.GREEN[500],
    danger: COLORS.RED[500],
    border: {
      primary: COLORS.GREY[800],
      secondary: COLORS.GREY[500],
    },
    text: {
      primary: COLORS.GREY[100],
      secondary: COLORS.GREY[400],
    },
  },
};

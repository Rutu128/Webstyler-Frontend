import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { url } from "./Config";

const ColorContext = createContext();

export const useColors = () => useContext(ColorContext);

export const ColorProvider = ({ children }) => {
  const [colors, setColors] = useState({
    background_color: "rgb(220, 220, 220)",
    button_color: "rgb(98, 174, 239)",
    navbar_color: "rgb(160, 162, 165)",
    page_font_color: "black",
    navbar_font_color: "black",
    button_font_color: "white",
  });

  const convertArrayToRgb = (colorArray) => {
    return `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`;
  };

  const fetchColors = async () => {
    try {
      const response = await axios.get(`${url}/get-colors`);
      const data = response.data.data;
      // console.log(data);
      
      // Convert array format to rgb strings
      const convertedColors = {
        background_color: convertArrayToRgb(data.background_color),
        button_color: convertArrayToRgb(data.button_color),
        navbar_color: convertArrayToRgb(data.navbar_color),
      };

      // Calculate contrasting font colors
      const pageFontColor = calculateContrastingColor(convertedColors.background_color);
      const navbarFontColor = calculateContrastingColor(convertedColors.navbar_color);
      const buttonFontColor = calculateContrastingColor(convertedColors.button_color);

      setColors({
        ...convertedColors,
        page_font_color: pageFontColor,
        navbar_font_color: navbarFontColor,
        button_font_color: buttonFontColor,
      });
      console.log(colors);
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  const calculateContrastingColor = (bgColor) => {
    // Extract RGB values from the rgb string or array
    let rgb;
    if (Array.isArray(bgColor)) {
      rgb = bgColor;
    } else {
      rgb = bgColor.match(/\d+/g).map(Number);
    }

    const [r, g, b] = rgb.map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.179 ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
  };

  useEffect(() => {
    fetchColors();
    const interval = setInterval(fetchColors,1000*10); // Fetch every hour
    return () => clearInterval(interval);
  }, []);

  return (
    <ColorContext.Provider value={colors}>{children}</ColorContext.Provider>
  );
};

export default ColorProvider;
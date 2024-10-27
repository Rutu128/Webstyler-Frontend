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
    if (!Array.isArray(colorArray) || colorArray.length !== 3) {
      console.error("Invalid color array:", colorArray);
      return "rgb(220, 220, 220)"; // fallback color
    }
    return `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`;
  };

  const calculateContrastingColor = (bgColor) => {
    try {
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
    } catch (error) {
      console.error("Error calculating contrasting color:", error);
      return "rgb(0, 0, 0)"; // fallback color
    }
  };

  const fetchColors = async () => {
    try {
      console.log('Fetching colors...');
      const response = await axios.get(`${url}/get-colors`);
      console.log('API Response:', response.data);
      
      const data = response.data.data;
      
      if (!data) {
        console.error("No data received from API");
        return;
      }

      console.log('Received color data:', data);

      // Convert array format to rgb strings
      const newColors = {
        background_color: convertArrayToRgb(data.background_color),
        button_color: convertArrayToRgb(data.button_color),
        navbar_color: convertArrayToRgb(data.navbar_color),
      };

      // console.log('Converted to RGB:', newColors);

      // Calculate contrasting font colors
      const updatedColors = {
        ...newColors,
        page_font_color: calculateContrastingColor(newColors.background_color),
        navbar_font_color: calculateContrastingColor(newColors.navbar_color),
        button_font_color: calculateContrastingColor(newColors.button_color),
      };

      // console.log('Final updated colors:', updatedColors);
      // console.log('Previous colors:', colors);

      // Direct state update instead of conditional
      setColors(updatedColors);

    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  // Add another useEffect to monitor colors changes
  useEffect(() => {
    console.log('Colors state updated:', colors);
  }, [colors]);

  useEffect(() => {
    // console.log('Component mounted, fetching initial colors...');
    fetchColors(); // Initial fetch
    
    // const interval = setInterval(() => {
    //   console.log('Interval triggered, fetching colors...');
    //   fetchColors();
    // }, 1000 * 10); // Fetch every 10 seconds
    
    // return () => {
    //   console.log('Component unmounting, clearing interval...');
    //   clearInterval(interval);
    // };
  }, []);

  return (
    <ColorContext.Provider value={colors}>
      {children}
    </ColorContext.Provider>
  );
};

export default ColorProvider;
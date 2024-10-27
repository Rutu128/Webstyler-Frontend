import React, { useEffect, useRef, useState } from "react";
import { record } from "rrweb";
import { url } from "./Config";

const SessionRecorder = () => {
  const eventsRef = useRef([]);
  const stopRecordingRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const getComputedStyle = (element, property) => {
    return window.getComputedStyle(element).getPropertyValue(property);
  };

  const captureColors = () => {
    const colors = {
      navbar: null,
      buttons: [],
      background: null,
    };

    // Capture navbar color
    const navbar = document.querySelector("nav");
    if (navbar) {
      colors.navbar = getComputedStyle(navbar, "background-color");
    }

    // Capture button colors
    const buttons = document.querySelectorAll("button, .btn");
    buttons.forEach((button) => {
      colors.buttons.push({
        backgroundColor: getComputedStyle(button, "background-color"),
        color: getComputedStyle(button, "color"),
      });
    });

    // Capture background color
    colors.background = getComputedStyle(document.body, "background-color");

    return colors;
  };

  const sendRecordingToBackend = async (events) => {
    try {
      const colors = captureColors();
      const response = await fetch(`${url}/api/recordings/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events, colors }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save recording");
      }

      const data = await response.json();
      console.log("Recording saved:", data.fileName);
    } catch (error) {
      console.error("Error saving recording:", error);
    }
  };

  useEffect(() => {
    const startRecording = () => {
      if (stopRecordingRef.current) return;

      stopRecordingRef.current = record({
        emit(event) {
          eventsRef.current.push(event);
        },
      });
      setIsRecording(true);
    };

    const stopRecording = () => {
      if (stopRecordingRef.current) {
        stopRecordingRef.current();
        stopRecordingRef.current = null;
        setIsRecording(false);
      }
    };

    const sendEvents = () => {
      if (eventsRef.current.length > 0) {
        sendRecordingToBackend([...eventsRef.current]);
        eventsRef.current = [];
      }
    };

    startRecording();

    const recordingInterval = setInterval(() => {
      stopRecording();
      sendEvents();
      startRecording();
    }, 10000*3); // Send events every 30 seconds

    return () => {
      stopRecording();
      sendEvents();
      clearInterval(recordingInterval);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        padding: "5px 10px",
        background: "#f0f0f0",
        borderRadius: "5px",
      }}
    >
      Recording: {isRecording ? "Active" : "Inactive"}
    </div>
  );
};

export default SessionRecorder;

import React, { useEffect, useState, useRef } from "react";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";
import { useColors } from "./ColorProvider";
import { url } from "./Config";

function RecordingsPage() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const playerContainerRef = useRef(null);
  const colors = useColors();

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${url}/api/recordings/list`);
      if (!response.ok) {
        throw new Error("Failed to fetch recordings");
      }
      const data = await response.json();
      setRecordings(data);
    } catch (error) {
      setError("Error fetching recordings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayRecording = async (recordingUrl) => {
    try {
      setError(null);
      setDebugInfo(null);
      const response = await fetch(`${url}${recordingUrl}`);
      if (!response.ok) {
        throw new Error("Failed to fetch recording data");
      }

      const data = await response.json();
      let events = Array.isArray(data.events) ? data.events : (Array.isArray(data) ? data : null);

      if (!events || events.length === 0) {
        throw new Error("No valid events data received");
      }

      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = '';

        const containerWidth = playerContainerRef.current.clientWidth || 800;
        const containerHeight = Math.min(containerWidth * 0.5625, 600);

        new rrwebPlayer({
          target: playerContainerRef.current,
          props: {
            events,
            width: containerWidth,
            height: containerHeight,
            showController: true,
            autoPlay: true,
          },
        });
      }
    } catch (error) {
      setError("Error playing recording: " + error.message);
      console.error("Error playing recording:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4" style={{ backgroundColor: colors.background_color, color: colors.page_font_color, minHeight: '100vh', paddingTop: '80px' }}>
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recordings-page" style={{ backgroundColor: colors.background_color, color: colors.page_font_color, minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container">
        <h1 className="text-center mb-5">Session Recordings</h1>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="row">
          <div className="col-md-4 mb-4">
            <h4 className="mb-3">Recording List</h4>
            <div className="list-group">
              {recordings.length === 0 ? (
                <div className="list-group-item text-muted">No recordings found</div>
              ) : (
                recordings.map((recording) => (
                  <button
                    key={recording.name}
                    className="list-group-item list-group-item-action"
                    onClick={() => handlePlayRecording(recording.url)}
                  >
                    {new Date(parseInt(recording.timestamp)).toLocaleString()}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="col-md-8">
            <div
              ref={playerContainerRef}
              className="border rounded"
              style={{
                minHeight: "400px",
                backgroundColor: colors.navbar_color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!recordings.length && (
                <div className="text-muted">Select a recording to play</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecordingsPage;
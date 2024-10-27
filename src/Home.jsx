import React, { useEffect, useState } from "react";
import { useColors } from "./ColorProvider";
import Common from "./Common";
import web from "../src/images/homepage1.jpg";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { HelpCircle } from "lucide-react";
import "./Home.css"

const Home = () => {
  const colors = useColors();
  const [tour, setTour] = useState(null);

  useEffect(() => {
    // Initialize tour but don't start it automatically
    const newTour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        scrollTo: true,
        classes: "shepherd-theme-custom shadow-md bg-purple-dark",
        cancelIcon: {
          enabled: true,
        },
        buttons: [
          {
            action() {
              return this.back();
            },
            classes: "shepherd-button-secondary",
            text: "Back",
          },
          {
            action() {
              return this.next();
            },
            text: "Next",
          },
        ],
      },
    });

    // Add all tour steps
    newTour.addStep({
      id: "greet",
      title: "Welcome!",
      text: getGreetingMessage(),
      attachTo: { element: "", on: "center" },
      buttons: [
        {
          action() {
            return this.next();
          },
          text: "Next",
        },
      ],
    });

    newTour.addStep({
      id: "navbar",
      title: "Navigation Bar",
      text: "This is the navigation bar. You can access different sections of the site here.",
      attachTo: { element: ".navbar", on: "bottom" },
    });

    newTour.addStep({
      id: "home-nav",
      title: "Home Page",
      text: "Click here to return to the home page at any time.",
      attachTo: { element: '.nav-link[href="/"]', on: "bottom" },
    });

    newTour.addStep({
      id: "service-nav",
      title: "Services",
      text: "Click here to view the services we offer.",
      attachTo: { element: '.nav-link[href="/service"]', on: "bottom" },
    });

    newTour.addStep({
      id: "about-nav",
      title: "About Us",
      text: "Learn more about us by clicking here.",
      attachTo: { element: '.nav-link[href="/about"]', on: "bottom" },
    });

    newTour.addStep({
      id: "contact-nav",
      title: "Contact Us",
      text: "Reach out to us via the contact page.",
      attachTo: { element: '.nav-link[href="/contact"]', on: "bottom" },
    });

    newTour.addStep({
      id: "recordings-nav",
      title: "Recordings",
      text: "Access recordings of past interactions here.",
      attachTo: { element: '.nav-link[href="/recordings"]', on: "bottom" },
    });

    setTour(newTour);

    // Cleanup
    return () => {
      if (newTour) {
        newTour.complete();
      }
    };
  }, []);

  const getGreetingMessage = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return "Good Morning! Welcome to our website!";
    } else if (currentHour < 18) {
      return "Good Afternoon! Let's explore the site!";
    } else {
      return "Good Evening! Take a look around our website!";
    }
  };

  const startTour = () => {
    if (tour) {
      tour.start();
    }
  };

  return (
    <div
      style={{
        backgroundColor: colors.background_color,
        minHeight: "100vh",
        paddingTop: "80px",
        position: "relative",
      }}
    >
      <button
        onClick={startTour}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg flex items-center gap-2"
        aria-label="Start Tour"
        style={{
          backgroundColor: colors.button_color,
          color: colors.button_font_color,
        }}
      >
        <HelpCircle size={24} />
        <span className="mr-1"style={{color:colors.button_font_color}}>Take Tour</span>
      </button>

      <Common
        name="Grow your Business with"
        highlight="React JS"
        imgsrc={web}
        visit="/service"
        btname="Get Started"
      />
    </div>
  );
};

export default Home;

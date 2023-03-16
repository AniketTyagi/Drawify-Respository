import React from "react";
import "react-chat-widget/lib/styles.css";
import Chatbox from "./drawifyChatbox.jsx";

/**
 * This code defines the react app
 *
 * Imports the router functionality to provide page navigation
 * Defines the Home function outlining the content on each page
 * Content specific to each page (Home and About) is defined in their components in /pages
 * Each page content is presented inside the overall structure defined here
 * The router attaches the page components to their paths
 */

function App() {
  return (<Chatbox />);
}

export default App;

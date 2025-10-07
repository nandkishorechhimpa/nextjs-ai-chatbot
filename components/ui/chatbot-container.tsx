"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import ChatbotButton from "./chatbot-button";

export const ChatbotContainer = () => {
  // Dynamically import the ChatbotWidget to prevent it from loading on the server
  const ChatbotWidget = dynamic(() => import("../chatbot-widget"), { ssr: false });
  const [isChatbotCollapsed, setIsChatbotCollapsed] = useState(true);

  // If the chatbot is collapsed, show a button to expand it
  return (
    <>
      {isChatbotCollapsed ? (
        <ChatbotButton setIsChatbotCollapsed={setIsChatbotCollapsed} />
      ) : (
        <ChatbotWidget  setIsChatbotCollapsed={setIsChatbotCollapsed}/>
      )}
    </>
  );
}
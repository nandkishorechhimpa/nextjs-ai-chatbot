"use client";
// components/ChatbotWidget.tsx
export default function ChatbotWidget({ setIsChatbotCollapsed }: { setIsChatbotCollapsed: (value: boolean) => void }) {
  // prevent recursive iframe loading
  if (typeof window !== "undefined" && window.location !== window.parent.location) {
    console.warn("Skipping chatbot iframe to prevent recursive loading");
    return null;
  }

  return (
    <>
    {/* Add a float button on the iframe to close it */}
    <button
      onClick={() => setIsChatbotCollapsed(true)}
      style={{
        position: "fixed",
        bottom: "630px",
        right: "20px",
        width: "40px",
        height: "40px",
        border: "none",
        borderRadius: "50%",
        backgroundColor: "#242835",
        color: "white",
        cursor: "pointer",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 10000,
      }}
      title="Close Chatbot">X</button>
     <iframe
      src="https://woodenspecialist.com/"
      title="NTech Chatbot"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "400px",
        height: "600px",
        border: "none",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        zIndex: 9999,
      }}
    />
    </>
   
  );
}

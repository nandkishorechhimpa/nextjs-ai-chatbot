"use client";
// components/ChatbotWidget.tsx
export default function ChatbotButton({ setIsChatbotCollapsed }: { setIsChatbotCollapsed: (value: boolean) => void }) {
  // on clicking the button setIsChatbotCollapsed to false
  const handleClick = () => {
    setIsChatbotCollapsed(false);
  };
  return (
    <button
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "60px",
        height: "60px",
        border: "none",
        borderRadius: "50%",
        backgroundColor: "#242835",
        color: "white",
        cursor: "pointer",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}>
        Ask
    </button>
    )

}

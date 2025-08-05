"use client";

import { UIMessage, useChat } from "@ai-sdk/react";
import { useState } from "react";
import { MessageMetadata } from "./api/chat/route";

export default function Chat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, stop, status } =
    useChat<UIMessage<MessageMetadata>>();

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput("");
        }}
        style={{ display: "flex", gap: "10px" }}
      >
        <input
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        {status === "streaming" && <button onClick={stop}>Stop</button>}
      </form>

      {messages.map((message) => (
        <div key={message.id} style={{ border: "1px solid red" }}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.metadata?.isAborted && (
            <div style={{ backgroundColor: "yellow" }}>Message Aborted</div>
          )}

          {message.parts.map((part, i) => {
            switch (part.type) {
              case "text":
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
            }
          })}
        </div>
      ))}
    </div>
  );
}

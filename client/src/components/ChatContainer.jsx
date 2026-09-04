import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import Logout from "./Logout";
import ChatInput from "./ChatInput";
import axios from "axios";
import { getAllMessagesRoute, sendMessageRoute } from "../utils/APIRoutes";
import { useEffect, useRef, useState } from "react";
import GroupSettings from "./GroupSettings";
import { avatarSrc, formatDay, formatTime, senderColor } from "../utils/format";

// Subtle WhatsApp-style doodle wallpaper (dark)
const chatWallpaper = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><g fill='none' stroke='#1f2c33' stroke-width='1'><path d='M30 30h28v28H30z'/><circle cx='120' cy='40' r='14'/><path d='M30 120l14-18 12 12 14-20 20 26'/><circle cx='120' cy='120' r='6'/><path d='M140 130h28v28h-28z'/><path d='M60 150l10-12 8 8'/><circle cx='40' cy='70' r='4'/></g></svg>`
)}")`;

function ChatContainer({ currentChat, currentUser, socket, onMessageSent, onBack }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  const handleSendMsg = async (msg, imageFile) => {
    const formData = new FormData();
    formData.append("from", currentUser._id);
    formData.append("to", currentChat._id);
    formData.append("isGroup", Boolean(currentChat?.isGroup));
    if (msg) formData.append("message", msg);
    if (imageFile) formData.append("image", imageFile);

    try {
      const response = await axios.post(sendMessageRoute, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "user-id": currentUser._id,
        },
      });

      if (response.data.message) {
        socket.current.emit("send-msg", {
          to: currentChat._id,
          from: currentUser._id,
          message: msg,
          image: response.data.message.message.image,
          isGroup: currentChat.isGroup,
          sender: {
            _id: currentUser._id,
            username: currentUser.username,
            avatarImage: currentUser.avatarImage,
          },
        });
        onMessageSent?.();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    const sock = socket.current;
    if (sock) {
      const handleMessageReceive = (data) => {
        // For group chats
        if (
          data.isGroup &&
          currentChat?.isGroup &&
          data.groupId === currentChat._id
        ) {
          setMessages((prev) => [
            ...prev,
            {
              ...data,
              fromSelf: data.from === currentUser._id,
              timestamp: new Date(data.timestamp),
            },
          ]);
        }
        // For 1:1 chats
        else if (
          !data.isGroup &&
          (data.from === currentChat?._id || data.to === currentChat?._id)
        ) {
          setMessages((prev) => [
            ...prev,
            {
              ...data,
              fromSelf: data.from === currentUser._id,
              timestamp: new Date(data.timestamp),
            },
          ]);
        }
      };

      sock.on("msg-receive", handleMessageReceive);

      return () => {
        sock.off("msg-receive", handleMessageReceive);
      };
    }
  }, [currentChat, currentUser, socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;
      try {
        const response = await axios.post(
          getAllMessagesRoute,
          {
            from: currentUser._id,
            to: currentChat._id,
            isGroup: currentChat.isGroup,
          },
          {
            headers: {
              "user-id": currentUser._id,
            },
          }
        );
        setMessages(response.data.projectedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [currentChat, currentUser]);

  // Group messages by day for WhatsApp-style date dividers
  const dayGroups = [];
  messages.forEach((m) => {
    const key = new Date(m.timestamp).toDateString();
    if (!dayGroups.length || dayGroups[dayGroups.length - 1].key !== key) {
      dayGroups.push({ key, label: formatDay(m.timestamp), items: [] });
    }
    dayGroups[dayGroups.length - 1].items.push(m);
  });

  let msgIndex = 0;
  const lastIndex = messages.length - 1;

  return (
    <Container>
      <header className="chat-header">
        <button
          className="back-btn"
          onClick={onBack}
          title="Back to chats"
          aria-label="Back to chats"
        >
          <FaArrowLeft />
        </button>
        <div className="avatar">
          <img src={avatarSrc(currentChat.avatarImage)} alt="" />
        </div>
        <div className="details">
          <h3>{currentChat.name}</h3>
          <p>
            {currentChat.isGroup
              ? `${currentChat.participants.length} members`
              : "Message this contact"}
          </p>
        </div>
        {currentChat.isGroup && (
          <GroupSettings group={currentChat} currentUser={currentUser} />
        )}
        <Logout />
      </header>

      <div className="chat-messages">
        {dayGroups.map((group, gi) => (
          <div key={gi}>
            <div className="day-divider">
              <span>{group.label}</span>
            </div>
            {group.items.map((message) => {
              const isLast = msgIndex === lastIndex;
              msgIndex += 1;
              return (
                <div
                  key={`${message._id || ""}-${message.timestamp}-${msgIndex}`}
                  className={`bubble-row ${message.fromSelf ? "out" : "in"}`}
                  ref={isLast ? scrollRef : null}
                >
                  {message.isGroup && !message.fromSelf && message.sender && (
                    <div className="sender-info">
                      <img
                        src={avatarSrc(message.sender.avatarImage)}
                        alt=""
                        className="sender-avatar"
                      />
                      <span
                        className="sender-name"
                        style={{
                          color: senderColor(message.sender.username || "User"),
                        }}
                      >
                        {message.sender.username || "Unknown"}
                      </span>
                    </div>
                  )}
                  <div className="bubble">
                    {message.image?.url && (
                      <div className="message-image">
                        <img src={message.image.url} alt="" />
                      </div>
                    )}
                    {message.message && (
                      <p className="bubble-text">{message.message}</p>
                    )}
                  </div>
                  <span className="bubble-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  background-color: var(--bg-app);

  .chat-header {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.55rem 1rem;
    background-color: var(--bg-elevated);

    .back-btn {
      display: none;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.4rem 0.5rem 0.4rem 0;
      border-radius: 50%;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--text);
      }
    }

    .avatar img {
      height: 40px;
      width: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .details {
      flex: 1;
      min-width: 0;

      h3 {
        font-size: 1rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      p {
        font-size: 0.78rem;
        color: var(--text-secondary);
      }
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    background-color: var(--bg-app);
    background-image: ${chatWallpaper};
    padding: 0.5rem 4% 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;

    .day-divider {
      display: flex;
      justify-content: center;
      margin: 0.75rem 0 0.5rem;

      span {
        background-color: var(--bg-elevated);
        color: var(--text-secondary);
        font-size: 0.74rem;
        padding: 0.25rem 0.75rem;
        border-radius: 8px;
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);
      }
    }

    .bubble-row {
      display: flex;
      flex-direction: column;

      &.in {
        align-items: flex-start;
      }
      &.out {
        align-items: flex-end;
      }

      .sender-info {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin: 0.5rem 0 0.15rem;

        .sender-avatar {
          height: 22px;
          width: 22px;
          border-radius: 50%;
          object-fit: cover;
        }

        .sender-name {
          font-size: 0.78rem;
          font-weight: 600;
        }
      }
    }

    .bubble {
      max-width: min(75%, 480px);
      padding: 0.45rem 0.65rem 0.45rem;
      border-radius: 8px;
      font-size: 0.92rem;
      line-height: 1.35;
      color: var(--text);
      word-break: break-word;
    }

    .in .bubble {
      background-color: var(--bg-elevated);
      border-top-left-radius: 2px;
    }

    .out .bubble {
      background-color: var(--sent);
      border-top-right-radius: 2px;
    }

    .bubble-text {
      margin: 0;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .bubble-time {
      display: block;
      font-size: 0.66rem;
      color: var(--text-secondary);
      user-select: none;
      padding: 0.1rem 0 0.4rem;
    }

    .out .bubble-time {
      text-align: right;
    }

    .message-image {
      margin-bottom: 0.2rem;

      img {
        display: block;
        max-width: min(260px, 60vw);
        max-height: 240px;
        border-radius: 6px;
        object-fit: cover;
      }
    }
  }

  @media screen and (max-width: 860px) {
    .chat-header {
      gap: 0.6rem;
      padding: 0.45rem 0.6rem;

      .back-btn {
        display: flex;
      }

      .details p {
        font-size: 0.72rem;
      }
    }

    .chat-messages {
      padding: 0.4rem 2.5% 0.8rem;

      .bubble {
        max-width: 82%;
      }

      .message-image img {
        max-width: min(220px, 65vw);
      }
    }
  }
`;

export default ChatContainer;
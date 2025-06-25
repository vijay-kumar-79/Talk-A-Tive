import styled from "styled-components";
import Logout from "./Logout";
import ChatInput from "./ChatInput";
import axios from "axios";
import { getAllMessagesRoute, sendMessageRoute } from "../utils/APIRoutes";
import { useEffect, useRef, useState } from "react";
import GroupSettings from "./GroupSettings";
import grpAvatar from "../assets/grpAvatar.png";

function ChatContainer({ currentChat, currentUser, socket }) {
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
        // Emit socket event with complete data
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
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
  if (socket.current) {
    const handleMessageReceive = (data) => {
      // For group chats
      if (data.isGroup && currentChat?.isGroup && data.groupId === currentChat._id) {
        setMessages(prev => [...prev, {
          ...data,
          fromSelf: data.from === currentUser._id,
          timestamp: new Date(data.timestamp),
        }]);
      }
      // For 1:1 chats
      else if (!data.isGroup && (data.from === currentChat?._id || data.to === currentChat?._id)) {
        setMessages(prev => [...prev, {
          ...data,
          fromSelf: data.from === currentUser._id,
          timestamp: new Date(data.timestamp),
        }]);
      }
    };

    socket.current.on("msg-receive", handleMessageReceive);

    return () => {
      if (socket.current) {
        socket.current.off("msg-receive", handleMessageReceive);
      }
    };
  }
}, [currentChat, currentUser]); // Make sure these dependencies are correct

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (currentChat) {
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
      }
    };
    fetchMessages();
  }, [currentChat]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details upp">
          <div className="avatar">
            {currentChat.isGroup ? (
              currentChat.avatarImage ? (
                <img
                  src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                  alt=""
                />
              ) : (
                <img src={grpAvatar} alt="" />
              )
            ) : (
              <img
                src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                alt=""
              />
            )}
          </div>
          <div className="username">
            <h3>
              {currentChat.isGroup ? currentChat.name : currentChat.username}
            </h3>
            {currentChat.isGroup && (
              <p>{currentChat.participants.length} members</p>
            )}
          </div>
        </div>
        {currentChat.isGroup && (
          <GroupSettings group={currentChat} currentUser={currentUser} />
        )}
        <Logout />
      </div>
      <div className="chat-messages">
        {messages.map((message, idx) => (
          <div
            ref={idx === messages.length - 1 ? scrollRef : null}
            key={message._id || idx}
          >
            {message.isGroup && !message.fromSelf && message.sender && (
              <div className="sender-info">
                <img
                  src={
                    message.sender.avatarImage
                      ? `data:image/svg+xml;base64,${message.sender.avatarImage}`
                      : "/default-avatar.png"
                  }
                  alt={message.sender.username || "User"}
                  className="sender-avatar"
                />
                <span className="sender-name">
                  {message.sender.username || "Unknown"}
                </span>
              </div>
            )}

            <div
              className={`message ${message.fromSelf ? "sended" : "recieved"}`}
            >
              <div className="content">
                {message.image?.url && (
                  <div className="message-image">
                    <img
                      src={message.image.url}
                      alt=""
                      onError={(e) => {
                        e.target.src = "/image-error.png";
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                )}
                {message.message && <p>{message.message}</p>}
                {/* Removed the timestamp div completely */}
              </div>
            </div>
          </div>
        ))}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 78% 12%;
  gap: 0.1rem;
  overflow: hidden;

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  .upp {
    margin-top: 1rem;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #9a86f3;
          padding: 0.1rem;
          background: white;
          transition: all 0.3s ease;
          &:hover {
            transform: scale(1.05);
          }
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .sender-info {
      display: flex;
      align-items: center;
      margin-bottom: 0.3rem;
      margin-left: 0.5rem;

      .sender-avatar {
        height: 1.5rem;
        width: 1.5rem;
        border-radius: 50%;
        margin-right: 0.5rem;
        object-fit: cover;
      }

      .sender-name {
        color: #aaa;
        font-size: 0.8rem;
        font-weight: 500;
      }
    }

    .message {
      display: flex;
      align-items: center;

      .content {
        max-width: 80%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;

        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }

        .message-image {
          margin-bottom: 0.5rem;

          img {
            max-width: 100%;
            max-height: 200px;
            max-width: 300px;
            border-radius: 0.5rem;
            object-fit: contain;
            cursor: pointer;
            transition: transform 0.2s;

            &:hover {
              transform: scale(1.02);
            }
          }
        }

        p {
          margin: 0;
          line-height: 1.4;
        }
      }
    }

    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }

    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;

  .group-icon {
    height: 3rem;
    width: 3rem;
    border-radius: 50%;
    background: #4e0eff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-right: 1rem;
  }
`;

export default ChatContainer;

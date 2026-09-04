import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { conversationsRoute, host } from "../utils/APIRoutes";
import Contacts from "./../components/Contacts";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import { io } from "socket.io-client";

function Chat() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const socket = useRef();

  useEffect(() => {
    const setUser = async () => {
      if (!localStorage.getItem("chat-app-user")) {
        navigate("/login");
      } else {
        const user = await JSON.parse(localStorage.getItem("chat-app-user"));
        setCurrentUser(user);
        setIsLoaded(true);
      }
    };
    setUser();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  const fetchConversations = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await axios.get(conversationsRoute, {
      headers: { "user-id": currentUser._id },
    });
    const sorted = [...data].sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
    });
    setConversations(sorted);
  }, [currentUser]);

  useEffect(() => {
    const init = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          await fetchConversations();
        } else {
          navigate("/setAvatar");
        }
      }
    };
    init();
  }, [currentUser, fetchConversations, navigate]);

  return (
    <Container className={currentChat ? "with-chat" : "no-chat"}>
      <div className="container">
        <div className="pane contacts-pane">
          <Contacts
            conversations={conversations}
            changeChat={setCurrentChat}
            currentChat={currentChat}
            refreshConversations={fetchConversations}
          />
        </div>
        <div className="pane chat-pane">
          {isLoaded && !currentChat && <Welcome currentUser={currentUser} />}
          {isLoaded && currentChat && (
            <ChatContainer
              currentChat={currentChat}
              currentUser={currentUser}
              socket={socket}
              onMessageSent={fetchConversations}
              onBack={() => setCurrentChat(undefined)}
            />
          )}
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  justify-content: center;
  overflow: hidden;
  background-color: var(--bg-app);

  .container {
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: minmax(300px, 30%) 1fr;
    grid-template-rows: 100%;
    grid-template-areas: "chats chat";
    overflow: hidden;
  }

  .pane {
    display: flex;
    min-width: 0;
    min-height: 0;
    overflow: hidden;

    > * {
      flex: 1;
      min-width: 0;
    }
  }

  .contacts-pane {
    grid-area: chats;
  }

  .chat-pane {
    grid-area: chat;
  }

  /* WhatsApp-style single pane below 860px: the open chat covers the
     whole screen and slides in from the right; back returns to the list */
  @keyframes pane-slide-in {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @media screen and (max-width: 860px) {
    .container {
      grid-template-columns: 100%;
      grid-template-rows: 100%;
      grid-template-areas: "screen";
    }

    .contacts-pane,
    .chat-pane {
      grid-area: screen;
    }

    &.no-chat .chat-pane {
      display: none;
    }

    &.with-chat .contacts-pane {
      display: none;
    }

    &.with-chat .chat-pane {
      animation: pane-slide-in 0.22s ease-out;
    }
  }
`;

export default Chat;
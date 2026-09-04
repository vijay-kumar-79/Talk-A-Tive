import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaCommentDots, FaUserPlus } from "react-icons/fa";
import { BiPowerOff } from "react-icons/bi";
import GroupCreateModal from "./GroupCreateModal";
import NewChatModal from "./NewChatModal";
import grpAvatar from "../assets/grpAvatar.png";
import { avatarSrc, formatTime } from "../utils/format";

function Contacts({ conversations, changeChat, currentChat, refreshConversations }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [query, setQuery] = useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const setUser = async () => {
      const data = await JSON.parse(localStorage.getItem("chat-app-user"));
      setCurrentUserName(data.username);
      setCurrentUserImage(data.avatarImage);
    };
    setUser();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.name.toLowerCase().includes(q));
  }, [conversations, query]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Container>
      <header className="sidebar-header">
        <div className="avatar">
          <img src={avatarSrc(currentUserImage)} alt="" />
        </div>
        <h2>{currentUserName}</h2>
        <button title="New chat" onClick={() => setShowNewChatModal(true)}>
          <FaUserPlus />
        </button>
        <button title="New group" onClick={() => setShowCreateGroupModal(true)}>
          <FaPlus />
        </button>
        <button title="Log out" onClick={logout}>
          <BiPowerOff />
        </button>
      </header>

      <div className="search">
        <FaSearch />
        <input
          type="text"
          placeholder="Search chats"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="list">
        {filtered.length === 0 && (
          <div className="empty">
            <FaCommentDots />
            <p>
              {query
                ? "No chats match your search"
                : "No conversations yet. Create a group to get started."}
            </p>
          </div>
        )}
        {filtered.map((c) => (
          <div
            key={c._id}
            className={`row ${currentChat?._id === c._id ? "active" : ""}`}
            onClick={() => changeChat(c)}
          >
            <img
              src={c.isGroup ? grpAvatar : avatarSrc(c.avatarImage)}
              alt=""
              className="row-avatar"
            />
            <div className="row-body">
              <div className="row-top">
                <h3>{c.name}</h3>
                {c.lastMessageAt && (
                  <span className="time">{formatTime(c.lastMessageAt)}</span>
                )}
              </div>
              <p className="preview">
                {c.lastMessage
                  ? `${c.lastMessageFromSelf ? "You: " : ""}${
                      c.lastMessage.image ? "Photo" : c.lastMessage.text
                    }`
                  : c.isGroup
                  ? `${c.participants.length} members`
                  : "Say hi"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onUserSelected={(user) => {
            setShowNewChatModal(false);
            changeChat({ ...user, isGroup: false, name: user.username });
          }}
        />
      )}

      {showCreateGroupModal && (
        <GroupCreateModal
          onClose={() => setShowCreateGroupModal(false)}
          onGroupCreated={(newGroup) => {
            setShowCreateGroupModal(false);
            changeChat({ ...newGroup, isGroup: true });
            refreshConversations();
          }}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  background-color: var(--bg-panel);
  border-right: 1px solid var(--divider);

  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.9rem;
    background-color: var(--bg-elevated);

    .avatar img {
      height: 40px;
      width: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    h2 {
      flex: 1;
      font-size: 1.05rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    button {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.15rem;
      cursor: pointer;
      padding: 0.4rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease, color 0.15s ease;

      &:hover {
        background: var(--bg-hover);
        color: var(--text);
      }
    }
  }

  .search {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0.5rem 0.75rem;
    padding: 0.55rem 0.9rem;
    background-color: var(--bg-elevated);
    border-radius: 8px;
    color: var(--text-secondary);

    svg {
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    input {
      flex: 1;
      min-width: 0;
      background: none;
      border: none;
      outline: none;
      color: var(--text);
      font-size: 0.9rem;

      &::placeholder {
        color: var(--text-secondary);
      }
    }
  }

  .list {
    flex: 1;
    overflow-y: auto;
    padding: 0.25rem 0;

    .empty {
      padding: 2.5rem 1.5rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;

      svg {
        font-size: 1.6rem;
        opacity: 0.6;
      }
    }

    .row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.6rem 0.9rem;
      cursor: pointer;

      &:hover {
        background-color: var(--bg-elevated);
      }
      &.active {
        background-color: var(--bg-hover);
      }

      .row-avatar {
        height: 48px;
        width: 48px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
        background-color: var(--bg-elevated);
      }

      .row-body {
        flex: 1;
        min-width: 0;
        padding: 0.15rem 0 0.6rem;
        border-bottom: 1px solid var(--divider);
      }

      &.active .row-body {
        border-bottom-color: transparent;
      }

      .row-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.5rem;

        h3 {
          font-size: 0.98rem;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .time {
          font-size: 0.72rem;
          color: var(--text-secondary);
          flex-shrink: 0;
        }
      }

      .preview {
        font-size: 0.85rem;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 0.1rem;
      }
    }
  }

  @media screen and (max-width: 860px) {
    .sidebar-header {
      padding: 0.5rem 0.6rem;
    }

    .search {
      margin: 0.4rem 0.6rem;
    }

    .list .row {
      padding: 0.55rem 0.75rem;
    }
  }
`;

export default Contacts;
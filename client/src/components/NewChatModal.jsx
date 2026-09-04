import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { avatarSrc } from "../utils/format";
import { FaSearch } from "react-icons/fa";

const NewChatModal = ({ onClose, onUserSelected }) => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const backend = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("chat-app-user"));
        const { data } = await axios.get(
          `${backend}/api/auth/newchatusers/${userData._id}`,
          {
            headers: { "user-id": userData._id },
          }
        );
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [backend]);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>New chat</h2>
        <div className="search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search for a user"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        {isLoading ? (
          <p className="status">Loading users...</p>
        ) : filtered.length === 0 ? (
          <p className="status">
            {query
              ? "No users match your search"
              : "All users already appear in your chats."}
          </p>
        ) : (
          <UserList>
            {filtered.map((user) => (
              <UserItem
                key={user._id}
                onClick={() => onUserSelected(user)}
              >
                <img src={avatarSrc(user.avatarImage)} alt="" />
                <span>{user.username}</span>
              </UserItem>
            ))}
          </UserList>
        )}
        <button type="button" className="cancel" onClick={onClose}>
          Cancel
        </button>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(11, 20, 26, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background-color: var(--bg-panel);
  border: 1px solid var(--divider);
  width: min(92vw, 420px);
  max-height: 85vh;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h2 {
    color: var(--text);
    font-size: 1.15rem;
    font-weight: 600;
  }

  .search {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.9rem;
    background-color: var(--bg-elevated);
    border-radius: 8px;
    color: var(--text-secondary);

    svg {
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--text);
      font-size: 0.92rem;

      &::placeholder {
        color: var(--text-secondary);
      }
    }
  }

  .status {
    color: var(--text-secondary);
    text-align: center;
    padding: 1.5rem 0;
    font-size: 0.9rem;
  }

  .cancel {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.92rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.5rem 0;
    text-align: center;

    &:hover {
      color: var(--text);
    }
  }
`;

const UserList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.55rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background-color: var(--bg-elevated);
  }

  img {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  span {
    color: var(--text);
    font-size: 0.95rem;
  }
`;

export default NewChatModal;
import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { avatarSrc } from "../utils/format";

const GroupCreateModal = ({ onClose, onGroupCreated }) => {
  const [name, setName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const backend = process.env.REACT_APP_BACKEND_URL;

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("chat-app-user"));
        const { data } = await axios.get(
          `${backend}/api/auth/allusers/${userData._id}`,
          {
            headers: {
              "user-id": userData._id,
            },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("chat-app-user"));
      const { data } = await axios.post(
        `${backend}/api/groups`,
        {
          name: name,
          participants: selectedUsers,
        },
        {
          headers: {
            "user-id": userData._id,
          },
        }
      );

      // The response includes populated admin/participants
      onGroupCreated({
        ...data.group,
        admin: {
          _id: data.group.admin._id,
          username: data.group.admin.username,
          avatarImage: data.group.admin.avatarImage,
        },
        participants: data.group.participants.map((p) => ({
          _id: p._id,
          username: p.username,
          avatarImage: p.avatarImage,
        })),
      });
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>New group</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <h3>Add members</h3>
          <UserList>
            {users.map((user) => (
              <UserItem key={user._id}>
                <input
                  type="checkbox"
                  id={user._id}
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => {
                    setSelectedUsers((prev) =>
                      prev.includes(user._id)
                        ? prev.filter((id) => id !== user._id)
                        : [...prev, user._id]
                    );
                  }}
                />
                <label htmlFor={user._id}>
                  <img src={avatarSrc(user.avatarImage)} alt="" />
                  <span>{user.username}</span>
                </label>
              </UserItem>
            ))}
          </UserList>
          <div className="actions">
            <button type="button" className="cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
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
  width: min(92vw, 500px);
  max-height: 85vh;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  overflow-y: auto;

  h2 {
    color: var(--text);
    margin-bottom: 1.25rem;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
  }

  h3 {
    color: var(--text-secondary);
    margin: 1rem 0 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  input[type="text"] {
    width: 100%;
    padding: 0.8rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--divider);
    background-color: var(--bg-elevated);
    color: var(--text);
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: var(--accent);
    }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }

  button {
    padding: 0.65rem 1.5rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background 0.15s ease;

    &.submit {
      background-color: var(--accent);
      color: #0b141a;

      &:hover:not(:disabled) {
        background-color: var(--accent-strong);
      }
      &:disabled {
        opacity: 0.6;
        cursor: default;
      }
    }

    &.cancel {
      background: none;
      color: var(--text-secondary);

      &:hover {
        color: var(--text);
      }
    }
  }
`;

const UserList = styled.div`
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid var(--divider);
  border-radius: 8px;
  padding: 0.35rem;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.45rem 0.5rem;
  border-radius: 6px;
  transition: background 0.15s ease;

  &:hover {
    background-color: var(--bg-elevated);
  }

  input[type="checkbox"] {
    margin-right: 0.8rem;
    accent-color: var(--accent);
    cursor: pointer;
  }

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
    flex-grow: 1;
    min-width: 0;
  }

  img {
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 50%;
    margin-right: 0.8rem;
    object-fit: cover;
    flex-shrink: 0;
  }

  span {
    color: var(--text);
    font-size: 0.92rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export default GroupCreateModal;
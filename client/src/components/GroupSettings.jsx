import { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { avatarSrc } from "../utils/format";

const GroupSettings = ({ group, currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState(group.participants);
  const backend = process.env.REACT_APP_BACKEND_URL;

  const removeMember = async (userId) => {
    const userData = JSON.parse(localStorage.getItem("chat-app-user"));
    try {
      await axios.post(
        `${backend}/api/groups/remove`,
        {
          groupId: group._id,
          userId,
        },
        {
          headers: {
            "user-id": userData._id,
          },
        }
      );
      setMembers((prev) => prev.filter((m) => m._id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = group.admin._id === currentUser._id;

  return (
    <SettingsContainer>
      <button className="settings-btn" onClick={() => setIsOpen(!isOpen)}>
        Group info
      </button>
      {isOpen && (
        <SettingsDropdown>
          <h3>Members ({members.length})</h3>
          <MemberList>
            {members.map((member) => (
              <MemberItem key={member._id}>
                <img src={avatarSrc(member.avatarImage)} alt="" />
                <span className="member-name">{member.username}</span>
                {member._id === group.admin._id && (
                  <span className="admin-tag">admin</span>
                )}
                {isAdmin && member._id !== currentUser._id && (
                  <button
                    className="remove-btn"
                    onClick={() => removeMember(member._id)}
                  >
                    Remove
                  </button>
                )}
              </MemberItem>
            ))}
          </MemberList>
        </SettingsDropdown>
      )}
    </SettingsContainer>
  );
};

const SettingsContainer = styled.div`
  position: relative;
  display: flex;

  .settings-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.45rem 0.75rem;
    border-radius: 8px;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
      background: var(--bg-hover);
      color: var(--text);
    }
  }
`;

const SettingsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 300px;
  max-height: 70vh;
  overflow-y: auto;
  background-color: var(--bg-panel);
  border: 1px solid var(--divider);
  border-radius: 12px;
  padding: 1rem;
  z-index: 30;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);

  h3 {
    color: var(--text);
    margin-bottom: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    border-bottom: 1px solid var(--divider);
    padding-bottom: 0.6rem;
  }
`;

const MemberList = styled.ul`
  list-style: none;
`;

const MemberItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.5rem 0.4rem;
  border-radius: 8px;
  margin-bottom: 0.25rem;
  transition: background 0.15s ease;

  &:hover {
    background-color: var(--bg-elevated);
  }

  img {
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .member-name {
    color: var(--text);
    flex: 1;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .admin-tag {
    color: var(--text-secondary);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }

  .remove-btn {
    background: none;
    border: 1px solid var(--danger);
    color: var(--danger);
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
      background: var(--danger);
      color: #0b141a;
    }
  }
`;

export default GroupSettings;
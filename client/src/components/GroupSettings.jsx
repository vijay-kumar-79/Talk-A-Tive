import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";

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

  return (
    <SettingsContainer>
      <button onClick={() => setIsOpen(!isOpen)}>Group Settings</button>
      {isOpen && (
        <SettingsDropdown>
          <h3>Group Members</h3>
          <MemberList>
            {members.map((member) => (
              <MemberItem key={member._id}>
                <img
                  src={`data:image/svg+xml;base64,${member.avatarImage}`}
                  alt=""
                />
                <span>{member.username}</span>
                {group.admin._id === currentUser._id &&
                  member._id !== currentUser._id && (
                    <button onClick={() => removeMember(member._id)}>
                      Remove
                    </button>
                  )}
                {member._id === group.admin._id && <span>(Admin)</span>}
              </MemberItem>
            ))}
          </MemberList>
          {group.admin._id === currentUser._id && (
            <AddMemberButton>
              {/* Implement add member functionality */}
            </AddMemberButton>
          )}
        </SettingsDropdown>
      )}
    </SettingsContainer>
  );
};

const SettingsContainer = styled.div`
  position: relative;
  margin-left: auto;

  button {
    background-color: #9a86f3;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
      background-color: #7d6ac8;
    }
  }
`;

const SettingsDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 300px;
  background-color: #080420;
  border: 1px solid #9a86f3;
  border-radius: 0.5rem;
  padding: 1rem;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

  h3 {
    color: white;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    border-bottom: 1px solid #9a86f3;
    padding-bottom: 0.5rem;
  }
`;

const MemberList = styled.ul`
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;

  &::-webkit-scrollbar {
    width: 0.3rem;

    &-thumb {
      background-color: #9a86f3;
      border-radius: 1rem;
    }
  }
`;

const MemberItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.3rem;
  margin-bottom: 0.5rem;
  background-color: #ffffff0a;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ffffff1a;
  }

  img {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    margin-right: 0.8rem;
    object-fit: cover;
    border: 1px solid #9a86f3;
  }

  span {
    color: white;
    flex-grow: 1;
    font-size: 0.9rem;
  }

  button {
    background-color: #ff4d4d;
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;

    &:hover {
      background-color: #e60000;
    }
  }
`;

const AddMemberButton = styled.button`
  width: 100%;
  background-color: #4e0eff !important;
  margin-top: 0.5rem;

  &:hover {
    background-color: #3a00cc !important;
  }
`;

export default GroupSettings;

import { useEffect, useState } from "react";
import styled from "styled-components";
import Logo from "../assets/logof.png";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import GroupCreateModal from "./GroupCreateModal";
import grpAvatar from "../assets/grpAvatar.png";

function Contacts({ contacts, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [activeTab, setActiveTab] = useState("chats");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const backend = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const setUser = async () => {
      const data = await JSON.parse(localStorage.getItem("chat-app-user"));
      setCurrentUserName(data.username);
      setCurrentUserImage(data.avatarImage);
    };
    setUser();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      if (currentUserName) {
        const userData = JSON.parse(localStorage.getItem("chat-app-user"));
        const { data } = await axios.get(
          `${backend}/api/groups/user`,
          {
            headers: {
              "user-id": userData._id, // Add this line
            },
          }
        );
        setGroups(data);
      }
    };
    fetchGroups();
  }, [currentUserName]);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  return (
    <>
      {currentUserName && currentUserImage && (
        <Container>
          <div className="brand">
            <img src={Logo} alt="Logo" />
          </div>
          <div className="contacts">
            <div className="tabs">
              <button
                className={activeTab === "chats" ? "active" : ""}
                onClick={() => setActiveTab("chats")}
              >
                Chats
              </button>
              <button
                className={activeTab === "groups" ? "active" : ""}
                onClick={() => setActiveTab("groups")}
              >
                Groups
              </button>
            </div>
            {activeTab === "chats" ? (
              contacts.map((contact, index) => {
                return (
                  <div
                    key={contact._id}
                    className={`contact ${
                      index === currentSelected ? "selected" : ""
                    }`}
                    onClick={() => changeCurrentChat(index, contact)}
                  >
                    <div className="avatar">
                      <img
                        src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                        alt=""
                      />
                    </div>
                    <div className="username">
                      <h3>{contact.username}</h3>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <button
                  className="create-group-btn"
                  onClick={() => setShowCreateGroupModal(true)}
                >
                  <FaPlus /> Create Group
                </button>
                {groups.map((group, index) => (
                  <div
                    key={group._id}
                    className={`contact ${
                      index === currentSelected ? "selected" : ""
                    }`}
                    onClick={() =>
                      changeCurrentChat(index, {
                        ...group,
                        isGroup: true,
                        // Ensure admin is properly formatted
                        admin: group.admin._id
                          ? group.admin
                          : { _id: group.admin },
                      })
                    }
                  >
                    <div className="avatar">
                      {/* {group.avatarImage ? (
                        <img
                          src={grpAvatar}
                          alt=""
                        />
                      ) : (
                        <div className="group-icon">G</div>
                      )} */}
                      <img src={grpAvatar} alt="" />
                    </div>
                    <div className="group-info">
                      <h3>{group.name}</h3>
                      <p>
                        Admin:{" "}
                        {typeof group.admin === "object"
                          ? group.admin.username
                          : "You"}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
            {showCreateGroupModal && (
              <GroupCreateModal
                onClose={() => setShowCreateGroupModal(false)}
                onGroupCreated={(newGroup) => {
                  setGroups((prev) => [...prev, newGroup]);
                  setShowCreateGroupModal(false);
                }}
              />
            )}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #080420;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 70%;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #ffffff34;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
    .selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 1rem;

  button {
    flex: 1;
    padding: 0.5rem;
    border: none;
    background: #ffffff34;
    color: white;
    cursor: pointer;

    &.active {
      background: #9a86f3;
    }
  }
`;

const GroupIcon = styled.div`
  height: 3rem;
  width: 3rem;
  border-radius: 50%;
  background: #4e0eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const CreateGroupButton = styled.button`
  background-color: #9a86f3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  transition: all 0.3s ease;

  &:hover {
    background-color: #7d6ac8;
  }

  svg {
    font-size: 1rem;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #080420;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
`;

export default Contacts;

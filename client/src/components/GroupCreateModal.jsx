import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";

const GroupCreateModal = ({ onClose, onGroupCreated }) => {
  const [name, setName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("chat-app-user"));
        // Remove the hardcoded "current-user-id" and use the actual user ID
        const { data } = await axios.get(
          `http://localhost:5000/api/auth/allusers/${userData._id}`,
          {
            headers: {
              "user-id": userData._id,
            },
          }
        );
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("chat-app-user"));
      const { data } = await axios.post(
        "http://localhost:5000/api/groups",
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

      // The response should now include populated admin/participants
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
        <h2>Create New Group</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Group Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <h3>Add Members</h3>
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
                  <img
                    src={`data:image/svg+xml;base64,${user.avatarImage}`}
                    alt=""
                  />
                  <span>{user.username}</span>
                </label>
              </UserItem>
            ))}
          </UserList>
          <button type="submit">Create Group</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
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
  width: 90%;
  max-width: 500px;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  max-height: 80vh;
  overflow-y: auto;

  h2 {
    color: white;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  h3 {
    color: white;
    margin: 1rem 0 0.5rem;
    font-size: 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  input[type="text"] {
    width: 100%;
    padding: 0.8rem;
    border-radius: 0.5rem;
    border: none;
    margin-bottom: 1rem;
    background-color: #ffffff34;
    color: white;
    font-size: 1rem;

    &:focus {
      outline: none;
      background-color: #ffffff4d;
    }
  }

  button {
    padding: 0.8rem;
    border-radius: 0.5rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  button[type="submit"] {
    background-color: #9a86f3;
    color: white;
    margin-top: 1rem;

    &:hover {
      background-color: #7d6ac8;
    }
  }

  button[type="button"] {
    background-color: transparent;
    color: #9a86f3;
    margin-top: 0.5rem;

    &:hover {
      color: #7d6ac8;
      text-decoration: underline;
    }
  }
`;

const UserList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
  border: 1px solid #9a86f3;
  border-radius: 0.5rem;
  padding: 0.5rem;

  &::-webkit-scrollbar {
    width: 0.3rem;

    &-thumb {
      background-color: #9a86f3;
      border-radius: 1rem;
    }
  }
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.3rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ffffff1a;
  }

  input[type="checkbox"] {
    margin-right: 0.8rem;
    cursor: pointer;
  }

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
    flex-grow: 1;
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
    font-size: 0.9rem;
  }
`;

export default GroupCreateModal;

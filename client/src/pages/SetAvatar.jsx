import { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";
import multiavatar from "@multiavatar/multiavatar/esm";

const toastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

export default function SetAvatar() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  useEffect(() => {
    const user = localStorage.getItem("chat-app-user");
    if (!user) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const generateAvatars = () => {
      const data = [];
      for (let i = 0; i < 4; i++) {
        const randomName = Math.random().toString(36).substring(2, 10);
        const svgCode = multiavatar(randomName);
        const encoded = btoa(unescape(encodeURIComponent(svgCode)));
        data.push(encoded);
      }
      setAvatars(data);
      setIsLoading(false);
    };
    generateAvatars();
  }, []);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    const user = await JSON.parse(localStorage.getItem("chat-app-user"));

    const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
      image: avatars[selectedAvatar],
    });

    if (data.isSet) {
      user.isAvatarImageSet = true;
      user.avatarImage = data.image;
      localStorage.setItem("chat-app-user", JSON.stringify(user));
      navigate("/");
    } else {
      toast.error("Error setting avatar. Please try again.", toastOptions);
    }
  };

  return (
    <Container>
      {isLoading ? (
        <img src={loader} alt="loader" className="loader" />
      ) : (
        <>
          <div className="title-container">
            <h1>Pick an avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`avatar ${selectedAvatar === index ? "selected" : ""}`}
                onClick={() => setSelectedAvatar(index)}
              >
                <img
                  src={`data:image/svg+xml;base64,${avatar}`}
                  alt={`avatar-${index}`}
                />
              </div>
            ))}
          </div>
          <button
            onClick={setProfilePicture}
            className="submit-btn"
            disabled={selectedAvatar === undefined}
          >
            Set as profile picture
          </button>
          <p className="note">Not happy with these? Refresh the page for new avatars</p>
          <ToastContainer />
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 2.5rem;
  background:
    radial-gradient(1100px 560px at 85% -10%, rgba(0, 168, 132, 0.16), transparent 60%),
    radial-gradient(900px 520px at -10% 110%, rgba(0, 168, 132, 0.1), transparent 55%),
    var(--bg-app);
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  overflow-y: auto;
  padding: 1.5rem 1rem;

  /* safe flexbox centering: auto margins center when there is room,
     and scroll instead of clipping on short screens */
  & > :first-child {
    margin-top: auto;
  }
  & > :last-child {
    margin-bottom: auto;
  }

  .loader {
    max-inline-size: 100%;
  }

  @media screen and (max-width: 860px) {
    gap: 1.75rem;

    .title-container h1 {
      font-size: 1.25rem;
    }

    .avatars {
      gap: 0.9rem;

      .avatar img {
        height: 4.4rem;
      }
    }

    .submit-btn {
      font-size: 0.95rem;
    }
  }

  .title-container {
    h1 {
      color: var(--text);
      font-size: 1.6rem;
      font-weight: 600;
      text-align: center;
    }
  }

  .avatars {
    display: flex;
    gap: 1.5rem;

    .avatar {
      border: 3px solid transparent;
      padding: 0.35rem;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: border-color 0.2s ease, transform 0.2s ease;

      img {
        height: 6rem;
        border-radius: 50%;
      }

      &:hover {
        cursor: pointer;
        transform: scale(1.06);
      }
    }

    .selected {
      border-color: var(--accent);
    }
  }

  .submit-btn {
    background-color: var(--accent);
    color: #0b141a;
    padding: 0.85rem 2rem;
    border: none;
    font-weight: 700;
    cursor: pointer;
    border-radius: 8px;
    font-size: 1rem;
    transition: background 0.15s ease, transform 0.1s ease;

    &:hover:not(:disabled) {
      background-color: var(--accent-strong);
    }
    &:active:not(:disabled) {
      transform: scale(0.99);
    }
    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  .note {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }
`;
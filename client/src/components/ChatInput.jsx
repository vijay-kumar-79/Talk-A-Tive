import { useEffect, useRef, useState } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { FaPaperclip } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import styled from "styled-components";
import EmojiPicker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  // Close emoji picker on ESC
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setShowEmojiPicker(false);
    if (showEmojiPicker) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showEmojiPicker]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (!msg.trim() && !image) return;
    handleSendMsg(msg, image);
    setMsg("");
    removeImage();
  };

  return (
    <Container>
      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
          <button type="button" onClick={removeImage} className="remove-btn">
            &times;
          </button>
        </div>
      )}
      <div className="input-bar">
        <button
          type="button"
          className="icon-btn"
          title="Emoji"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <BsEmojiSmileFill />
        </button>
        <button
          type="button"
          className="icon-btn"
          title="Attach image"
          onClick={() => fileInputRef.current.click()}
        >
          <FaPaperclip />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        <form className="input-form" onSubmit={sendChat}>
          <input
            type="text"
            placeholder="Type a message"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />
          <button type="submit" className="send-btn" title="Send">
            <IoMdSend />
          </button>
        </form>
      </div>
      {showEmojiPicker && (
        <div className="emoji-picker">
          <EmojiPicker
            width={320}
            onEmojiClick={({ emoji }) =>
              emoji && setMsg((prev) => prev + emoji)
            }
          />
        </div>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  background-color: var(--bg-elevated);

  .input-bar {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 1rem;
  }

  .icon-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.35rem;
    cursor: pointer;
    padding: 0.3rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s ease;

    &:hover {
      color: var(--text);
    }
  }

  .input-form {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--bg-input);
    border-radius: 8px;
    padding: 0.3rem 0.4rem 0.3rem 0.9rem;

    input {
      flex: 1;
      min-width: 0;
      background: none;
      border: none;
      outline: none;
      color: var(--text);
      font-size: 0.95rem;

      &::placeholder {
        color: var(--text-secondary);
      }
    }

    .send-btn {
      background-color: var(--accent);
      color: #0b141a;
      border: none;
      border-radius: 50%;
      width: 38px;
      height: 38px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.1s ease;

      svg {
        font-size: 1.15rem;
      }

      &:hover {
        background-color: var(--accent-strong);
      }
      &:active {
        transform: scale(0.94);
      }
    }
  }

  .emoji-picker {
    position: absolute;
    bottom: 4.4rem;
    left: 1rem;
    z-index: 20;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .image-preview {
    position: absolute;
    bottom: 4.4rem;
    left: 5rem;
    max-width: 220px;
    max-height: 220px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .remove-btn {
      position: absolute;
      top: 0.3rem;
      right: 0.3rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 1.5rem;
      height: 1.5rem;
      font-size: 1.1rem;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  @media screen and (max-width: 860px) {
    .input-bar {
      padding: 0.5rem 0.6rem calc(0.5rem + env(safe-area-inset-bottom, 0px));
      gap: 0.4rem;
    }

    .icon-btn {
      font-size: 1.25rem;
    }

    .emoji-picker {
      left: 50%;
      right: auto;
      transform: translateX(-50%);
      bottom: 3.9rem;
    }

    .image-preview {
      left: 0.75rem;
      bottom: 3.9rem;
      max-width: 180px;
      max-height: 180px;
    }
  }
`;
import styled from "styled-components";

export const AuthPage = styled.div`
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  overflow-y: auto;
  background:
    radial-gradient(1100px 560px at 85% -10%, rgba(0, 168, 132, 0.16), transparent 60%),
    radial-gradient(900px 520px at -10% 110%, rgba(0, 168, 132, 0.1), transparent 55%),
    var(--bg-app);
`;

export const AuthCard = styled.div`
  width: min(92vw, 420px);
  margin: auto;
  background: var(--bg-panel);
  border: 1px solid var(--divider);
  border-radius: 16px;
  padding: 2.5rem 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);

  @media screen and (max-width: 860px) {
    padding: 1.75rem 1.4rem;
    gap: 1rem;
    border-radius: 14px;
  }
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 0.25rem;

  img {
    height: 3.25rem;
  }
  h1 {
    color: var(--text);
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
`;

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const AuthInput = styled.input`
  width: 100%;
  background: var(--bg-elevated);
  border: 1px solid var(--divider);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  color: var(--text);
  font-size: 0.95rem;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: var(--text-secondary);
  }
  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

export const AuthButton = styled.button`
  width: 100%;
  background: var(--accent);
  color: #0b141a;
  border: none;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover {
    background: var(--accent-strong);
  }
  &:active {
    transform: scale(0.99);
  }
`;

export const AuthLink = styled.p`
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;

  a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;
import styled from "styled-components";
import Robot from "../assets/robot.gif";

const Welcome = ({ currentUser }) => {
  if (!currentUser) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <img src={Robot} alt="Welcome GIF" />
      <h1>
        Welcome, <span>{currentUser.username}!</span>
      </h1>
      <h3>Select a chat to start messaging</h3>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
  background-color: var(--bg-app);

  img {
    height: 20rem;
    max-width: 80vw;
  }

  h1 {
    color: var(--text);
    font-size: 1.8rem;
    font-weight: 600;
    text-align: center;

    span {
      color: var(--accent);
    }
  }

  h3 {
    color: var(--text-secondary);
    font-weight: 400;
    font-size: 1rem;
    text-align: center;
  }
`;

export default Welcome;
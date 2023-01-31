import buildClient from "../api/build-client";

const Landing = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are not signed in</h1>
  );
};

// hooks can only be used inside react components!!
// so we cannot use the useRequest hook here
Landing.getInitialProps = async (context) => {
  const { data } = await buildClient(context).get("/api/users/currentuser");
  return data;
};

export default Landing;

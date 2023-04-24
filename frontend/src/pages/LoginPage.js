import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
/*The 'useNavigate' hook makes it easy to navigate programmatically */
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //additional variable for keeping track of any errors during login:
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const logIn = async () => {
    try {
      await signInWithEmailAndPassword(getAuth(), email, password);
      //taking the users to the articles page post log-in:
      navigate("/articles");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <h1>Login</h1>
      {error && <p className="error">{error}</p>}
      {/*We bind the above state variables to the inputs: */}
      <input
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={logIn}>Log in</button>
      <Link to="/create-account">Create an account!</Link>
    </>
  );
};

export default LoginPage;

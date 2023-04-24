import { Link, useNavigate } from "react-router-dom";
/*difference between Link and navigate:
https://stackoverflow.com/questions/71781348/difference-between-link-and-usenavigate-from-react-router-dom#:~:text=Note%20also%20that%20Link%20is,can%20be%20used%20in%20callbacks. */
import useUser from "./hooks/useUser";
import { getAuth, signOut } from "firebase/auth";

const NavBar = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  return (
    <nav style={{ backgroundColor: "lightgray" }}>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/articles">Articles</Link>
        </li>
      </ul>
      <div className="nav-right">
        {user ? (
          <button
            onClick={() => {
              signOut(getAuth());
            }}
          >
            log out
          </button>
        ) : (
          <button
            onClick={() => {
              navigate("/login");
            }}
          >
            log in
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

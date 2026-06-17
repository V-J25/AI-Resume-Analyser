import { useContext, useEffect } from "react";
import { AuthContext } from "../authContext.js";
import { register, login, logout, getme } from "../services/auth.api.js";
export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setuser, loading, setloading } = context;

  const handleLogin = async ({ email, password }) => {
    setloading(true);
    try {
      const data = await login({ email, password });

      setuser(data.user); //data ke ander smaan ayega jo abhi api call lgayi react
      // react mein saman ayega backend se vo user bhi dega to data ke ander user ayega
      return true;
    } catch (err) {
      console.log(err);
      return false;
    } finally {
      setloading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setloading(true);
    try {
      const data = await register({ username, email, password });
      setuser(data.user); //data le ander smaan ayega jo abhi api call lgayi react
      // react mein saman ayega backend se vo user bhi degi to data ke ander user ayega
      return true;
    } catch (err) {
      console.log(err);
      return false;
    } finally {
      setloading(false);
    }
  };

  const handleLogout = async () => {
    setloading(true);
    try {
      await logout();
      setuser(null);
    } catch (err) {
      console.log(err);
    } finally {
      setloading(false);
    }
  };
  useEffect(() => {
    const getAndSetUSer = async () => {
      try {
        const data = await getme();
        setuser(data.user);
      } catch (err) {
        console.log(err);
        setuser(null);
      } finally {
        setloading(false);
      }
    };
    getAndSetUSer();
  }, [setloading, setuser]);

  return { user, loading, handleLogin, handleLogout, handleRegister };
};

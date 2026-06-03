import { useState } from "react";
import { AuthContext } from "./authContext.js";

export const AuthProvider=({children})=>{

     const [user,setuser] = useState(null)
     const [loading, setloading] = useState(true)

     return (
        <AuthContext.Provider value={{user,setuser,loading,setloading}}>
        {children}
        </AuthContext.Provider>
     )
}

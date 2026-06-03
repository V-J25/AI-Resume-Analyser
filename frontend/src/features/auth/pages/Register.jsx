import { useNavigate,Link} from 'react-router';
import {useState} from 'react'
import { useAuth } from '../hooks/useAuth.js';
const Register = () => {
 const {loading,handleRegister}=useAuth();
const [username,setusername] = useState("")
const [email,setemail] = useState("")
const [password,setpassword] = useState("")
 const navigate=useNavigate();

    const handleSubmit =async(e)=>{
        e.preventDefault();
        const success = await handleRegister({username,email,password})
        if (success) {
            navigate('/')
        }
    }

    if(loading){
        return <main> <h1>Loading......</h1> </main>
    }

   

 return (
    <main>
    <div className='form-container'>
        <h1>Register</h1>

        <form onSubmit={handleSubmit}>

             <div className='input-group'>
                <label htmlFor="username">Username</label>
                <input onChange={(e)=>{
                    setusername(e.target.value)
                }} type="text" id='username' name='username' placeholder='Enter username' />
            </div>

            <div className='input-group'>
                <label htmlFor="email">Email</label>
                <input onChange={(e)=>{
                    setemail(e.target.value)
                }} type="email" id='email' name='email' placeholder='Enter email' />
            </div>

             <div className='input-group'   >
                <label htmlFor="password">Password</label>
                <input onChange={(e)=>{
                    setpassword(e.target.value)
                }} type="password" id='password' name='password' placeholder='Enter password' />
            </div>
         <button className='button primary-button'>Register</button>
        </form>
        <p>
            Already have an account?<Link to={'/login'}>Login</Link>
        </p>
    </div>
    </main>
  )
}

export default Register

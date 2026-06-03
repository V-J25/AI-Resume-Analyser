import {useState} from 'react'
import '../authform.scss';
import { useNavigate,Link } from 'react-router';
import { useAuth } from '../hooks/useAuth.js';
const Login = () => {
   const navigate=useNavigate();
    const {loading,handleLogin}=useAuth();

    const [email, setemail] = useState("")
    const [password,setpassword]=useState("")

    const handleSubmit=async (e)=>{
   e.preventDefault()
    const success = await handleLogin ({email,password})
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
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
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
         <button className='button primary-button'>Login</button>
        </form>
        <p>New user?<Link to={'/register'}>Register</Link>

        </p>
    </div>
    </main>
  )
}

export default Login

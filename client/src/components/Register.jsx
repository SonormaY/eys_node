import React, {useEffect, useState, useContext} from 'react'
import './../App.css'
import {Link, useNavigate, Navigate} from 'react-router-dom'
import { AuthContext } from "./AuthContext";
import axios from 'axios'

// assets
import video from './../assets/video.mp4'
import horizontal_logo_alternative from './../assets/eys-logo-horizontal-alternative.svg'

// icons
import { FaUserShield } from 'react-icons/fa'
import { MdAlternateEmail } from "react-icons/md";
import { BsFillShieldLockFill } from 'react-icons/bs'
import { FaArrowRightToBracket } from "react-icons/fa6";

const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    return emailRegex.test(email)
}

const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters long'
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one digit'
    return null
}

const Register = () => {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [registerStatus, setRegisterStatus] = useState('')
    const [statusHolder, setStatusHolder] = useState('message')
    const { setToken, token, loading, setRole } = useContext(AuthContext);
    const navigateTo = useNavigate()

    useEffect(() => {
        if (registerStatus) {
            setTimeout(() => {
                setRegisterStatus('')
                setStatusHolder('message')
            }, 10000)
        }
    }, [registerStatus])

    if (loading) {
        return null;
    }
    if (token) {
    return <Navigate to="/" replace />;
    }

    const createUser = () => {
        if (!email || !username || !password) {
            setRegisterStatus('Please fill in all fields')
            setStatusHolder('showMessage')
            return
        }

        if (!validateEmail(email)) {
            setRegisterStatus('Invalid email')
            setStatusHolder('showMessage')
            return
        }

        const passwordError = validatePassword(password)
        if (passwordError) {
            setRegisterStatus(passwordError)
            setStatusHolder('showMessage')
            return
        }
        axios.post(import.meta.env.VITE_API_URL + 'service/register', {
            email: email,
            username: username,
            password: password
        }).then((response) => {
            if (response.data.token) {
                setToken(response.data.token)
                setRole(response.data.role)
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('role', response.data.role)
                navigateTo('/')
            }
            else if (response.data.error) {
                setRegisterStatus(response.data.error)
                setStatusHolder('showMessage')
            }
        })
    }

    return (
        <div className='registerPage flex'>
            <div className="container flex">
                <div className="videoDiv">
                    <video src={video} autoPlay muted loop></video>

                    <div className="textDiv">
                        <h2 className="title">Encrypt all your valuable data with us!</h2>
                    </div>

                    <div className="footerDiv flex">
                        <span className="text">Already have an account?</span>
                        <Link to="/login" className="link">
                            <button className="btn">Login</button>
                        </Link>
                    </div>
                </div>

                <div className="formDiv flex">
                    <div className="headerDiv">
                        <img src={horizontal_logo_alternative} alt="Detailed Logo EYS" />
                    </div>

                    <form action="" className="form grid">
                        <span className={statusHolder}>{registerStatus}</span>

                        <div className="inputDiv">
                            <label htmlFor="email">Email</label>
                            <div className="input flex">
                            <MdAlternateEmail className='icon'/>
                                <input type="email" name="email" id="email" placeholder="Enter Email" onChange={(event) => {
                                    setEmail(event.target.value)
                                }}/>
                            </div>
                        </div>

                        <div className="inputDiv">
                            <label htmlFor="username">Username</label>
                            <div className="input flex">
                                <FaUserShield className="icon"/>
                                <input type="text" name="username" id="username" placeholder="Enter Username" onChange={(event) => {
                                    setUsername(event.target.value)
                                }}/>
                            </div>
                        </div>

                        <div className="inputDiv">
                            <label htmlFor="password">Password</label>
                            <div className="input flex">
                                <BsFillShieldLockFill className="icon"/>
                                <input type="password" name="password" id="password" placeholder="Enter Password" onChange={(event) => {
                                    setPassword(event.target.value)
                                }}/>
                            </div>
                        </div>

                        <button type='button' className='btn flex' onClick={createUser}>
                            <span>Register</span>
                            <FaArrowRightToBracket className='icon'/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register

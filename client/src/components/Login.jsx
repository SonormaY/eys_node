import React, {useEffect, useState} from 'react'
import './../App.css'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'

// assets
import video from './../assets/video.mp4'
import horizontal_logo_alternative from './../assets/eys-logo-horizontal-alternative.svg'

// icons
import { MdAlternateEmail } from "react-icons/md";
import { BsFillShieldLockFill } from 'react-icons/bs'
import { FaArrowRightToBracket } from "react-icons/fa6";

const Login = () => {
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginStatus, setLoginStatus] = useState('')
    const [statusHolder, setStatusHolder] = useState('message')
    const navigateTo = useNavigate()

    const loginUser = () => {
        // basic validation
        if (!loginEmail || !loginPassword) {
            setLoginStatus('Please fill in all fields')
            setStatusHolder('showMessage')
            return
        }
        axios.post('http://localhost:3001/login', {
            email: loginEmail,
            password: loginPassword
        }).then((response) => {
            console.log(response)
            if (response.data.message) {
                navigateTo('/dashboard')
            }
            else if (response.data.error) {
                setLoginStatus(response.data.error)
                setStatusHolder('showMessage')
            }
        })
    }

    useEffect(() => {
        if (loginStatus) {
            setTimeout(() => {
                setLoginStatus('')
                setStatusHolder('message')
            }, 10000)
        }
    })

    return (
        <div className='loginPage flex'>
            <div className="container flex">
                <div className="videoDiv">
                    <video src={video} autoPlay muted loop></video>

                    <div className="textDiv">
                        <h2 className="title">Encrypt all your valuable data with us!</h2>
                    </div>

                    <div className="footerDiv flex">
                        <span className="text">Don't have an account?</span>
                        <Link to="/register" className="link">
                            <button className="btn">Register</button>
                        </Link>
                    </div>
                </div>

                <div className="formDiv flex">
                    <div className="headerDiv">
                        <img src={horizontal_logo_alternative} alt="Detailed Logo EYS" />
                    </div>

                    <form action="" className="form grid">
                        <span className={statusHolder}>{loginStatus}</span>
                        <div className="inputDiv">
                            <label htmlFor="email">Email</label>
                            <div className="input flex">
                            <MdAlternateEmail className='icon'/>
                                <input type="email" name="email" id="email" placeholder="Enter Email" onChange={(event) => {
                                    setLoginEmail(event.target.value)
                                }}/>
                            </div>
                        </div>

                        <div className="inputDiv">
                            <label htmlFor="password">Password</label>
                            <div className="input flex">
                                <BsFillShieldLockFill className="icon"/>
                                <input type="password" name="password" id="password" placeholder="Enter Password" onChange={(event) => {
                                    setLoginPassword(event.target.value)
                                }}/>
                            </div>
                        </div>

                        <button type='button' className='btn flex' onClick={loginUser}>
                            <span>Login</span>
                            <FaArrowRightToBracket className='icon'/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
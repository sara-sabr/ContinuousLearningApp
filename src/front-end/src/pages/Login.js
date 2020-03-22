import React, { useCallback } from 'react'
import { Redirect, withRouter } from 'react-router-dom'

import { withKeycloak } from '@react-keycloak/web'
import { Navigation } from '../components/organisms/Navigation'

const Login = withRouter(
  withKeycloak(({ keycloak, location }) => {
    const { from } = location.state || { from: { pathname: '/home' } }
    console.log(from)
    if (keycloak.authenticated) return <Redirect to={from} />

    const login = useCallback(() => {
      keycloak.login(
        {
         redirectUri: "http://localhost:3000/dashboard"
        }
      )
    }, [keycloak])

    return (
      <div>
        <Navigation/>
        <button type="button" onClick={login}>
          Login
        </button>
      </div>
    )
  })
)

export default Login
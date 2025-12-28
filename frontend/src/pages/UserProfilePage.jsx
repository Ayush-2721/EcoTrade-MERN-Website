import React from 'react'
import { UserProfile } from '../features/user/components/UserProfile'
import {Navbar} from '../features/navigation/components/Navbar'
import {Footer} from '../features/footer/Footer'

export const UserProfilePage = () => {
  return (
    <>
    <Navbar/>
    <UserProfile/>
    <Footer/>
    </>
  )
}

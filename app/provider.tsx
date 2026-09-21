"use client"
import axios from "axios"
import { useEffect, useState } from "react"
import { UserDetailContext } from "./context/userDetailContext"
const Provider = ({children} : {children : React.ReactNode}) => {

    const [userDetail, setUserDetail] = useState<any>();
    useEffect(() => {
        createNewUser()
    }, [])

    const createNewUser = async () => {
        const result = await axios.post("/api/users");
        console.log(result.data)
        setUserDetail(result.data)
    }

  return (
    <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
        <div>{children}</div>
    </UserDetailContext.Provider>
  )
}

export default Provider
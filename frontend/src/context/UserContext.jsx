import { createContext, useState, useEffect } from "react";
import api from "../api";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [userInfo, setUserInfo] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/auth/me')
                .then(({ data }) => {
                    setUserInfo(data);
                    setReady(true);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setUserInfo(null);
                    setReady(true);
                });
        } else {
            setReady(true);
        }
    }, []);

    return (
        <UserContext.Provider value={{ userInfo, setUserInfo, ready }}>
            {children}
        </UserContext.Provider>
    );
}

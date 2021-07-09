import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useHistory } from 'react-router-dom';


export const SignOutButton = () => {
    const { instance } = useMsal();
    let history = useHistory();

    const handleLogout = (logoutType) => {
        setAnchorEl(null);

        if (logoutType === "popup") {
            instance.logoutPopup();
            history.push('/');
        } else if (logoutType === "redirect") {
            instance.logoutRedirect();
        }
    }

    return 
};
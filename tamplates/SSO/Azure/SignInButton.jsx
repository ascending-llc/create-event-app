import { useMsal } from "@azure/msal-react";

export const SignInButton = () => {
    const { instance } = useMsal();

    const handleLogin = async (loginType) => {
        setAnchorEl(null);
        if (loginType === "popup") {
            try {
                await instance.loginPopup();
            } catch (error) {
                console.log("catched error: " + error);
            }  
        } else if (loginType === "redirect") {
            try {
                await instance.loginRedirect();
            } catch (error) {
                console.log("catched error: " + error);
            }
            
        }
    }

    return
};
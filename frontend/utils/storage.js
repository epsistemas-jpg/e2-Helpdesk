export const Storage = {

    setToken(token) {

        localStorage.setItem("token", token);

    },
    setTrustedDevice(token) {

        localStorage.setItem("trusted_device", token);

    },

    getTrustedDevice() {

        return localStorage.getItem("trusted_device");

    },

    removeTrustedDevice() {

        localStorage.removeItem("trusted_device");

    },

    getToken() {

        return localStorage.getItem("token");

    },

    removeToken() {

        localStorage.removeItem("token");

    },

    setUser(user) {

        localStorage.setItem(

            "user",

            JSON.stringify(user)

        );

    },

    getUser() {

        const user = localStorage.getItem("user");

        return user ? JSON.parse(user) : null;

    },

    logout(){

    localStorage.removeItem("token");

    localStorage.removeItem("user");


    
    
    
}



};
import React, {createContext, useState, useContext} from "react";

const VMContext = createContext();

export function useVM() {
    return useContext(VMContext);
}

export function VMProvider({children}) {
    const [isConnected, setIsConnected] = useState(false);
    // const [vmDetails, setVmDetails] = useState({});

    // const connectToVM = (details) => {
    //     setVmDetails(details);
    //     setIsConnected(true);
    // };

    // const disconnectFromVM = () => {
    //     setVmDetails({});
    //     setIsConnected(false);
    // };

    return (
        <VMContext.Provider value={{isConnected, vmDetails, connectToVM, disconnectFromVM}}>
            {children}
        </VMContext.Provider>
    );
}
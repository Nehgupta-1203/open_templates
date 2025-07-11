import React from "react";
import {Drawer, List, ListItem, ListItemIcon, ListItemText} from "@mui/material";
import DnsIcon from '@mui/icons-material/Dns';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DashboardIcon from '@mui/icons-material/Dashboard';
import {Link, useLocation} from "react-router-dom";


const menu = [
    {label: "Connect to VM", icon: <DnsIcon/>, path: "/", alwaysEnabled: true},
    {label: "Deploy Docker Image", icon: <CloudUploadIcon/>, path: "/deploy", alwaysEnabled: false},
    {label: "Dashboard", icon: <DashboardIcon/>, path: "/dashboard", alwaysEnabled: false}
];

export default function Sidebar() {
    return(
        <Drawer variant="permanent" sx={{width: 240, flexShrink: 0, "& .MuiDrawer-paper": {width: 240, boxSizing: "border-box", background: "#121212", color: "#fff"}}}>
            <List>
                {menu.map((item) => {
                    const enabled = item.alwaysEnabled
                    return(
                         <ListItem
                          button
                          key={item.label}
                          component={enabled?Link:"div"}
                          to={enabled?item.path:undefined} 
                          disabled={!enabled}
                          selected={useLocation().pathname === item.path}
                          sx={{opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? "auto" : "none", "&.Mui-selected": {backgroundColor: "#1e88e5", color: "#fff"}}}>
                        <ListItemIcon sx={{color:"#fff"}}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label}/>
                         </ListItem>   
                    );
                })
                }
            </List>
        </Drawer>
    );
}
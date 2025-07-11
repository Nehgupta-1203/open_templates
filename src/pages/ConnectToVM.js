import React, {useState} from 'react';
import {TextField, Button, Typography, Paper, Box, Alert} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ConnectToVM() {
return(
<Paper sx={{maxWidth: 400, mx: "auto", mt:8, p:4}}>
    <Typography variant="h5" align="center" gutterBottom>
        Connect to VM
    </Typography>
</Paper>
);
}
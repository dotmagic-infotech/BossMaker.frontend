import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const PasswordField = ({
    label = 'Password',
    placeholder,
    value,
    onChange,
    disabled = false,
    fullWidth = true,
    ...rest
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleToggleVisibility = () => setShowPassword((prev) => !prev);

    return (
        <TextField
            label={label}
            placeholder={placeholder}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            disabled={disabled}
            fullWidth={fullWidth}
            variant="outlined"
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={handleToggleVisibility} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            {...rest}
        />
    );
};

export default PasswordField;

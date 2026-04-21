import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const SettingsPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const [name, setName] = useState<string>("Himasha Fernando");
  const [email, setEmail] = useState<string>("himasha@gmail.com");
  const [password, setPassword] = useState<string>("");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSave = (): void => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }

    if (password && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    alert("Settings saved successfully!");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: 500,
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <IconButton
              onClick={() => navigate("/chat")}
              sx={{ color: "#0f172a" }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Settings
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                bgcolor: "#3b82f6",
              }}
            >
              H
            </Avatar>
          </Box>

          <TextField
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          <Typography sx={{ mb: 1 }}>Change Password</Typography>

          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
            }
            label="Enable Notifications"
          />

          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            }
            label="Dark Mode"
          />

          {error && (
            <Typography sx={{ color: "red", mt: 1 }}>
              {error}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              sx={{
                color: "#ef4444",
                borderColor: "#ef4444",
              }}
            >
              Logout
            </Button>

            <Button
              variant="contained"
              sx={{
                bgcolor: "#3b82f6",
                "&:hover": { bgcolor: "#2563eb" },
              }}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};


export default SettingsPage;

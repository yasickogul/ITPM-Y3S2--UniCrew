import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Chip,
  IconButton,
} from "@mui/material";

import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

interface Member {
  name: string;
  role: "Admin" | "Member";
}

const GroupInfoPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const members: Member[] = [
    { name: "Himasha Fernando", role: "Admin" },
    { name: "Kasun Perera", role: "Member" },
    { name: "Nimal Silva", role: "Member" },
    { name: "Amaya Fernando", role: "Member" },
  ];

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
          bgcolor: "#ffffff",
          color: "#0f172a",
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            color: "#0f172a",
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <CardContent sx={{ textAlign: "center", pt: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              bgcolor: "#3b82f6",
            }}
          >
            <GroupIcon fontSize="large" />
          </Avatar>

          <Typography variant="h5" sx={{ mt: 2, fontWeight: "bold" }}>
            IT 2023 June Batch
          </Typography>

          <Typography sx={{ fontSize: 14, color: "#64748b", mt: 1 }}>
            3rd Year Group Chat - University Discussion Space
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Chip
              label="24 Members"
              sx={{ bgcolor: "#e0f2fe", color: "#0369a1", mr: 1 }}
            />
            <Chip
              label="Active Group"
              sx={{ bgcolor: "#d1fae5", color: "#065f46" }}
            />
          </Box>
        </CardContent>

        <Divider />

        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Members
          </Typography>

          <List>
            {members.map((member, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "#3b82f6", color: "#fff" }}>
                    {member.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={member.name}
                  secondary={
                    <span style={{ color: "#64748b" }}>
                      {member.role}
                    </span>
                  }
                />

                {member.role === "Admin" && (
                  <Chip
                    label="Admin"
                    size="small"
                    sx={{
                      bgcolor: "#facc15",
                      color: "#713f12",
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        </CardContent>

        <Divider />

        <CardContent
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            sx={{
              color: "#3b82f6",
              borderColor: "#3b82f6",
              "&:hover": { bgcolor: "#e0f2fe" },
            }}
          >
            Edit Group
          </Button>

          <Button
            variant="outlined"
            sx={{
              color: "#ef4444",
              borderColor: "#ef4444",
              "&:hover": { bgcolor: "#fee2e2" },
            }}
          >
            Leave Group
          </Button>

          <Button
            variant="contained"
            sx={{
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb" },
            }}
          >
            Mute
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GroupInfoPage;

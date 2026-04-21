import React from "react";
import { Box, Typography } from "@mui/material";

import GroupList from "./GroupList";
import ChatBox from "./ChatBox";


const ChatPage = (): React.ReactElement => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f8fafc",
      }}
    >
      <Box
        sx={{
          width: "95%",
          maxWidth: "1200px",
          height: "92vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #93c5fd",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          bgcolor: "#ffffff",
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            height: "64px",
            bgcolor: "#b0d4f7",
            color: "#0f172a",
            display: "flex",
            alignItems: "center",
            px: 3,
            borderBottom: "1px solid #93c5fd",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Group Chat
          </Typography>
        </Box>

        {/* CONTENT */}
        <Box sx={{ display: "flex", flex: 1 }}>
          {/* SIDEBAR */}
          <Box
            sx={{
              width: "30%",
              minWidth: "280px",
              bgcolor: "#ffffff",
              borderRight: "1px solid #93c5fd",
            }}
          >
            <GroupList />
          </Box>

          {/* CHAT AREA */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              bgcolor: "#f8fafc",
              p: 3,
            }}
          >
            <ChatBox />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage;

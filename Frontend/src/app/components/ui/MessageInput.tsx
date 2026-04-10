import React from "react";
import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const MessageInput = (): React.ReactElement => {
  return (
    <Box sx={{ display: "flex", p: 2, borderTop: "1px solid #ddd" }}>
      <TextField
        fullWidth
        placeholder="Type a message..."
        variant="outlined"
        size="small"
      />

      <IconButton color="primary">
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default MessageInput;
